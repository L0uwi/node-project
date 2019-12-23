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

const dbMet: MetricsHandler = new MetricsHandler('./db/metrics')
/*
app.get('/', (req: any, res: any) => {
  res.write('Hello world')
  res.end()
})*/

app.get('/hello/:name', (req: any, res: any) => {
  res.render('index.ejs', { name: req.params.name })
})

app.get('/metrics/:id', (req: any, res: any) => {
  dbMet.get(req.params.id, (err: Error | null, result?: any) => {
    if (err) throw err
    res.json(result)
  })
})

app.post('/metrics/:id', (req: any, res: any) => {
  dbMet.save(req.params.id, req.body, (err: Error | null) => {
    if (err) throw err
    res.status(200).send()
  })
})

app.listen(port, (err: Error) => {
  if (err) throw err
  console.log(`Server is running on http://localhost:${port}`)
})

import session = require('express-session')
import levelSession = require('level-session-store')

const LevelStore = levelSession(session)

app.use(session({
  secret: 'my very secret phrase',
  store: new LevelStore('./db/sessions'),
  resave: true,
  saveUninitialized: true
}))

import { UserHandler, User } from './user'
const dbUser: UserHandler = new UserHandler('./db/users')
const authRouter = express.Router()

authRouter.get('/login', (req: any, res: any) => {
  res.render('login')
})

authRouter.get('/signup', (req: any, res: any) => {
  res.render('signup')
})

authRouter.get('/logout', (req: any, res: any) => {
  delete req.session.loggedIn
  delete req.session.user
  res.redirect('/login')
})

authRouter.post('/login', (req: any, res: any, next: any) => {
  console.log("authRouter post method\n")
  dbUser.get(req.body.username, (err: Error | null, result?: User) => {
    if (err) next(err)
    if (result === undefined || !result.validatePassword(req.body.password)) {
      res.redirect('/login')
    } else {
      req.session.loggedIn = true
      req.session.user = result
      res.redirect('/metric/' + req.body.username)
    }
  })
})

app.use(authRouter)

const userRouter = express.Router()

userRouter.post('/', (req: any, res: any, next: any) => {
  console.log("userRouter post method\n")
  dbUser.get(req.body.username, function (err: Error | null, result?: User) {
    if (!err || result !== undefined) {
      res.status(409).send("user already exists")
    } else {
      let user = new User(req.body.username, req.body.email, req.body.password)
      dbUser.save(user, function (err: Error | null) {
        if (err) next(err)
        else res.status(201).send("user persisted")
      })
    }
  })
})

userRouter.get('/:username', (req: any, res: any, next: any) => {
  console.log("user router get method\n")
  dbUser.get(req.params.username, function (err: Error | null, result?: User) {
    if (err || result === undefined) {
      res.status(404).send("user not found")
    } else res.status(200).json(result)
  })
})

app.use('/user', userRouter)

const authCheck = function (req: any, res: any, next: any) {
  if (req.session.loggedIn) {
    next()
  } else res.redirect('/login')
}

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

metricRouter.get('/modify/:date', (req:any, res:any, next:any) => {
  let key = req.session.user.username+":"+req.params.date
  console.log("ici c'est la"+key)
  dbMet.get2(key, function (err: Error | null, result?: Metric) {
    if (err || result === undefined) {
      res.status(404).send("user not found")
    }
    else{
      res.render('index', { modify: result, name: req.session.user.username, metrics: null })
    }
  })
})

metricRouter.get('/delete/:date', (req: any, res: any, next: any) => {
  dbMet.del(req.params.date, req.session.user.username, function (err: Error | null) {
    if (err) next(err)
    else {
      //res.status(201).send("metric persisted");
      console.log("metric deleted")
      res.redirect('/metric/'+req.session.user.username)
    }
  })
})


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

metricRouter.post('/', (req: any, res: any, next: any) => {
  var dd = req.body.dd;
  if (dd < 10 && dd.toString().length == 1) {
    dd = '0' + dd;
  }
  var mm = req.body.mm;
  if (mm < 10 && mm.toString().length == 1) {
    mm = '0' + mm;
  }
  var yyyy = req.body.yyyy
  req.session.user.username
  var date = dd + '-' + mm + '-' + yyyy;
  let met = new Metric(date, req.body.quantity)
  dbMet.save1(met, req.session.user.username, function (err: Error | null) {
    if (err) next(err)
    else {
      //res.status(201).send("metric persisted");
      console.log("user persisted")
      res.redirect('/metric/' + req.session.user.username)
    }
  })
})


metricRouter.post('/modify', (req: any, res: any, next: any) => {
  console.log("Alors :"+req.body.modif_date+req.body.modif_quantity)
  let met = new Metric(req.body.modif_date, req.body.modif_quantity)
  dbMet.save1(met, req.session.user.username, function (err: Error | null) {
    if (err) next(err)
    else {
      //res.status(201).send("metric persisted");
      console.log("user persisted")
      res.redirect('/metric/' + req.session.user.username)
    }
  })
})


app.use('/metric', metricRouter)



/*dbMet.get(req.body.username, function (err: Error | null, result?: User) {
  if (!err || result !== undefined) {
   res.status(409).send("user already exists")
  } else {
    let user = new User(req.body.username, req.body.email, req.body.password)
    dbUser.save(user, function (err: Error | null) {
      if (err) next(err)
      else res.status(201).send("user persisted")
    })
  }
})*/

