import express = require('express')
import { MetricsHandler, Metric } from './metrics'
import path = require('path')
import bodyparser = require('body-parser')

const app = express()
const port: string = process.env.PORT || '8080'
app.use(express.static(path.join(__dirname, '/../public')))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded())

app.set('views', __dirname + "/../views")
app.set('view engine', 'ejs');

//defining dbMet as MetricsHandler (see: metrics.ts file)
const dbMet: MetricsHandler = new MetricsHandler('./db/metrics')


//rendering hello.ejs (views folder)
app.get('/hello/:name', (req: any, res: any) => {
  res.render('index.ejs', { name: req.params.name })
})

//Get metrics from if retreived from URL
app.get('/metrics/:id', (req: any, res: any) => {
  dbMet.get1(req.params.id, (err: Error | null, result?: any) => {
    if (err) throw err
    res.json(result)
  })
})

//Save metrics to db
app.post('/metrics/:id', (req: any, res: any) => {
  dbMet.save(req.params.id, req.body, (err: Error | null) => {
    if (err) throw err
    res.status(200).send()
  })
})

//Running the server
app.listen(port, (err: Error) => {
  if (err) throw err
  console.log(`Server is running on http://localhost:${port}`)
})



//Open a levelDB Session, see documentation: https://github.com/maxogden/node-level-session
import session = require('express-session')
import levelSession = require('level-session-store')

const LevelStore = levelSession(session)

app.use(session({
  secret: 'my very secret phrase',
  store: new LevelStore('./db/sessions'),
  resave: true,
  saveUninitialized: true
}))

//USER
import { UserHandler, User } from './user'
const dbUser: UserHandler = new UserHandler('./db/users')
const authRouter = express.Router()

app.use(authRouter)


//source: https://medium.com/@kongruksiamza/nodejs-validate-data-and-alert-message-in-ejs-template-engine-f2844a4cb255
const { check, validationResult } = require('express-validator');
//Routing to login
authRouter.get('/login', (req: any, res: any) => {
  res.render('login')
})

//Routing to signup
authRouter.get('/signup', (req: any, res: any) => {
  res.render('signup', { err: null })
})

//Routing to logout
authRouter.get('/logout', (req: any, res: any) => {
  delete req.session.loggedIn
  delete req.session.user
  res.redirect('/login')
})

//Function used to redirect to login if username incorrect or connect if ok
authRouter.post('/login', (req: any, res: any, next: any) => {
  console.log("authRouter post method\n")
  dbUser.get(req.body.username, (err: Error | null, result?: User) => {
    /*if (err) 
    {
      next(err)
      res.redirect('/login')
    }*/
    if (result === undefined || !result.validatePassword(req.body.password)) {
      res.redirect('/login')
    } else {
      req.session.loggedIn = true
      req.session.user = result
      res.redirect('/metric/' + req.body.username)
    }
  })
})

authRouter.post('/signup', [
  check('mail', 'email is required').isEmail(),
  check('password', 'password has to be longer than five characters').isLength({ min: 5 })], (req: any, res: any, next: any) => {
    //Uses User get function (see user.ts line 55)
    dbUser.get(req.body.username, function (err: Error | null, result?: User) {

      //check validate data
      const resu = validationResult(req);
      var errors = resu.errors;

      if (!dbUser.confirmMail(req.body.mail, req.body.confirm_mail)) {
        errors.push({
          value: 'confirm mail',
          msg: 'Mail and confirm mail are not identical',
          param: 'mail',
          location: 'body'
        })
      }

      if (!dbUser.confirmPassword(req.body.password, req.body.confirm_password)) {
        errors.push({
          value: 'confirm password',
          msg: 'Password and confirm password are not identical',
          param: 'password',
          location: 'body'
        })
      }

      //If return value different from undifined, the user already exists
      if (!err || result !== undefined) {
        errors.push({
          value: 'exists',
          msg: 'This user already exists !',
          param: 'username',
          location: 'body'
        })
      }

      if (!resu.isEmpty() /*|| errors.length !=0*/) {

        res.status(409).render('signup', { err: errors })

      } else {
        //Else, we add it to the database
        let user = new User(req.body.username, req.body.mail, req.body.password)
        dbUser.save(user, function (err: Error | null) {
          if (err) next(err)
          //Respond that the add is successfull
          else res.status(200).redirect('/login')
        })
      }
    })
  })


const userRouter = express.Router()

//Used to store data of user in database, Aknowledges if User exists already or if add successfull
userRouter.post('/', (req: any, res: any, next: any) => {
  dbUser.get(req.body.username, function (err: Error | null, result?: User) {
    //If return value different from undifined, the user already exists
    if (!err || result !== undefined) {
      res.status(409).send("user already exists")
    } else {
      //Else, we add it to the database
      let user = new User(req.body.username, req.body.email, req.body.password)
      dbUser.save(user, function (err: Error | null) {
        if (err) next(err)
        //Respond that the add is successfull
        else res.status(201).send("user persisted")
      })
    }
  })
})

//Used to store data of user in database, Aknowledges if User exists already or if add successfull
userRouter.get('/delete', (req: any, res: any, next: any) => {
  let username = req.session.user.username
  delete req.session.loggedIn
  delete req.session.user
  dbUser.delete(username, function (err: Error | null, result?: User) {
    if (!err) {
      res.status(200).redirect('/login')//send("user successfully deleted")
      //res.redirect('/login')
    } else {
      res.status(400).send("an error occured")
    }
  })
})

//Used to store data of user in database, Aknowledges if User exists already or if add successfull
userRouter.get('/delete/:username', (req: any, res: any, next: any) => {
  let username = req.params.username
  delete req.session.loggedIn
  delete req.session.user
  dbUser.delete(username, function (err: Error | null, result?: User) {
    if (!err) {
      res.status(200).redirect('/login')//send("user successfully deleted")
      //res.redirect('/login')
    } else {
      res.status(400).send("an error occured")
    }
  })
})


//Get value from User db
userRouter.get('/:username', (req: any, res: any, next: any) => {
  console.log("user router get method\n")
  dbUser.get(req.params.username, function (err: Error | null, result?: User) {
    if (err || result === undefined) {
      res.status(404).send("user not found")
    } else res.status(200).json(result)
  })
})

app.use('/user', userRouter)

//Routing depending on logginedIn value
const authCheck = function (req: any, res: any, next: any) {
  if (req.session.loggedIn) {
    next()
  } else res.redirect('/login')
}

//Routing to main page, calls authCheck to verify that user is loggedIn
app.get('/', authCheck, (req: any, res: any) => {
  res.render('index', { metrics: null, name: req.session.username, modify: null })
})


const metricRouter = express.Router()


metricRouter.get('/:username', (req: any, res: any, next: any) => {
  dbMet.get1(req.params.username, function (err: Error | null, result?: Metric[]) {
    if (err || result === undefined) {
      res.status(404).send("user not found")
    }
    else {
      //res.status(200).json(result);
      res.render('index', { metrics: result, name: req.session.user.username, modify: null })
    }
  })
})

//routing method to get the modifying metric and fill the form with its data
//calls the get2 method
metricRouter.get('/modify/:date', (req: any, res: any, next: any) => {
  let key = req.session.user.username + ":" + req.params.date
  console.log("ici c'est la" + key)
  dbMet.get2(key, function (err: Error | null, result?: Metric) {
    if (err || result === undefined) {
      res.status(404).send("user not found")
    }
    else {
      res.render('index', { modify: result, name: req.session.user.username, metrics: null })
    }
  })
})

//routing to delete a special metric
//call del method
metricRouter.get('/delete/:date', (req: any, res: any, next: any) => {
  dbMet.del(req.params.date, req.session.user.username, function (err: Error | null) {
    if (err) next(err)
    else {
      //res.status(201).send("metric persisted");
      console.log("metric deleted")
      res.redirect('/metric/' + req.session.user.username)
    }
  })
})

//routing to get all the metrics from a user
//call get1 method
metricRouter.get('/', (req: any, res: any, next: any) => {
  dbMet.get1(req.session.user.username, function (err: Error | null, result?: Metric[]) {
    if (err || result === undefined) {
      res.status(404).send("user not found")
    } else {
      //res.status(200).json(result)
      res.render('index', { metrics: result, modify: null, name: req.session.user.username })
    }
  })
})

//routing to create a new metric
//call the save1 method
metricRouter.post('/', (req: any, res: any, next: any) => {
  /*var dd = req.body.dd;
  if (dd < 10 && dd.toString().length == 1) {
    dd = '0' + dd;
  }
  var mm = req.body.mm;
  if (mm < 10 && mm.toString().length == 1) {
    mm = '0' + mm;
  }
  var yyyy = req.body.yyyy
  req.session.user.username
  var date = dd + '-' + mm + '-' + yyyy;*/
  console.log(req.body.date)
  let met = new Metric(req.body.date, req.body.quantity)
  dbMet.save1(met, req.session.user.username, function (err: Error | null) {
    if (err) next(err)
    else {
      //res.status(201).send("metric persisted");
      res.redirect('/metric/' + req.session.user.username)
    }
  })

})


//routing for modifying: creates another metric to overwrite the old one
//call the save1 method
metricRouter.post('/modify', (req: any, res: any, next: any) => {
  let met = new Metric(req.body.modif_date, req.body.modif_quantity)
  dbMet.save1(met, req.session.user.username, function (err: Error | null) {
    if (err) next(err)
    else {
      //res.status(201).send("metric persisted");
      res.redirect('/metric/' + req.session.user.username)
    }
  })
})


app.use('/metric', metricRouter)

module.exports = app;
