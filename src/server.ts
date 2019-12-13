import express = require('express')
import { MetricsHandler } from './metrics'
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
/*
app.get('/', (req: any, res: any) => {
  res.write('Hello world')
  res.end()
})*/

//ROUTING

//rendering hello.ejs (views folder)
app.get('/hello/:name', (req: any, res: any) => {
  res.render('hello.ejs', {name: req.params.name})
})

//Get metrics from if retreived from URL
app.get('/metrics/:id', (req: any, res: any) => {
  dbMet.get(req.params.id, (err: Error | null, result?: any) => {
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

//Routing to login
authRouter.get('/login', (req: any, res: any) => {
  res.render('login')
})

//Routing to signup
authRouter.get('/signup', (req: any, res: any) => {
  res.render('signup')
})

//Routing to logout
authRouter.get('/logout', (req: any, res: any) => {
  delete req.session.loggedIn
  delete req.session.user
  res.redirect('/login')
})

//Function used to redirect to login if username incorrect or connect if ok
authRouter.post('/login', (req: any, res: any, next: any) => {
  dbUser.get(req.body.username, (err: Error | null, result?: User) => {
    if (err) next(err)
    if (result === undefined || !result.validatePassword(req.body.password)) {
      res.redirect('/login')
    } else {
      req.session.loggedIn = true
      req.session.user = result
      res.redirect('/')
    }
  })
})

app.use(authRouter)

const userRouter = express.Router()

//Used to store data of user in database, Aknowledges if User exists already or if add successfull
userRouter.post('/', (req: any, res: any, next: any) => {
  //Uses User get function (see user.ts line 55)
  dbUser.get(req.body.username, function (err: Error | null, result?: User) {
    //If return value different from undifined, the user already exists
    if (!err || result !== undefined) {
     res.status(409).send("user already exists")
    } else {
      //Else, we add it to the database
      let user = new User(req.body.username,req.body.email,req.body.password)
      dbUser.save(user, function (err: Error | null) {
        if (err) next(err)
        //Respond that the add is successfull
        else res.status(201).send("user persisted")
      })
    }
  })
})

//Get value from User db
userRouter.get('/:username', (req: any, res: any, next: any) => {
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
  res.render('index', { name: req.session.username })
})