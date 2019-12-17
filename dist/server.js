"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var metrics_1 = require("./metrics");
var path = require("path");
var bodyparser = require("body-parser");
var app = express();
var port = process.env.PORT || '8080';
app.use(express.static(path.join(__dirname, '/../public')));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded());
app.set('views', __dirname + "/../views");
app.set('view engine', 'ejs');
var dbMet = new metrics_1.MetricsHandler('./db/metrics');
/*
app.get('/', (req: any, res: any) => {
  res.write('Hello world')
  res.end()
})*/
app.get('/hello/:name', function (req, res) {
    res.render('index.ejs', { name: req.params.name });
});
app.get('/metrics/:id', function (req, res) {
    dbMet.get(req.params.id, function (err, result) {
        if (err)
            throw err;
        res.json(result);
    });
});
app.post('/metrics/:id', function (req, res) {
    dbMet.save(req.params.id, req.body, function (err) {
        if (err)
            throw err;
        res.status(200).send();
    });
});
app.listen(port, function (err) {
    if (err)
        throw err;
    console.log("Server is running on http://localhost:" + port);
});
var session = require("express-session");
var levelSession = require("level-session-store");
var LevelStore = levelSession(session);
app.use(session({
    secret: 'my very secret phrase',
    store: new LevelStore('./db/sessions'),
    resave: true,
    saveUninitialized: true
}));
var user_1 = require("./user");
var dbUser = new user_1.UserHandler('./db/users');
var authRouter = express.Router();
authRouter.get('/login', function (req, res) {
    res.render('login');
});
authRouter.get('/signup', function (req, res) {
    res.render('signup');
});
authRouter.get('/logout', function (req, res) {
    delete req.session.loggedIn;
    delete req.session.user;
    res.redirect('/login');
});
authRouter.post('/login', function (req, res, next) {
    console.log("authRouter post method\n");
    dbUser.get(req.body.username, function (err, result) {
        if (err)
            next(err);
        if (result === undefined || !result.validatePassword(req.body.password)) {
            res.redirect('/login');
        }
        else {
            req.session.loggedIn = true;
            req.session.user = result;
            res.redirect('/metric/' + req.body.username);
        }
    });
});
app.use(authRouter);
var userRouter = express.Router();
userRouter.post('/', function (req, res, next) {
    console.log("userRouter post method\n");
    dbUser.get(req.body.username, function (err, result) {
        if (!err || result !== undefined) {
            res.status(409).send("user already exists");
        }
        else {
            var user = new user_1.User(req.body.username, req.body.email, req.body.password);
            dbUser.save(user, function (err) {
                if (err)
                    next(err);
                else
                    res.status(201).send("user persisted");
            });
        }
    });
});
userRouter.get('/:username', function (req, res, next) {
    console.log("user router get method\n");
    dbUser.get(req.params.username, function (err, result) {
        if (err || result === undefined) {
            res.status(404).send("user not found");
        }
        else
            res.status(200).json(result);
    });
});
app.use('/user', userRouter);
var authCheck = function (req, res, next) {
    if (req.session.loggedIn) {
        next();
    }
    else
        res.redirect('/login');
};
app.get('/', authCheck, function (req, res) {
    res.render('index', { metrics: null, name: req.session.username });
});
var metricRouter = express.Router();
metricRouter.get('/:username', function (req, res, next) {
    console.log("user router get method\n");
    dbMet.get1(req.params.username, function (err, result) {
        if (err || result === undefined) {
            res.status(404).send("user not found");
        }
        else {
            //res.status(200).json(result);
            res.render('index', { metrics: result, name: req.session.user.username });
        }
    });
});
metricRouter.get('/delete/:date', function (req, res, next) {
    console.log("on est all\n");
    dbMet.del(req.params.date, req.session.user.username, function (err) {
        if (err)
            next(err);
        else {
            //res.status(201).send("metric persisted");
            console.log("metric deleted");
            res.redirect('/metric/' + req.session.user.username);
        }
    });
});
metricRouter.get('/', function (req, res, next) {
    dbMet.get1(req.session.user.username, function (err, result) {
        if (err || result === undefined) {
            res.status(404).send("user not found");
        }
        else {
            //res.status(200).json(result)
            res.render('index', { metrics: result, name: req.session.user.username });
        }
    });
});
metricRouter.post('/', function (req, res, next) {
    var dd = req.body.dd;
    if (dd < 10 && dd.toString().length == 1) {
        dd = '0' + dd;
    }
    var mm = req.body.mm;
    if (mm < 10 && mm.toString().length == 1) {
        mm = '0' + mm;
    }
    var yyyy = req.body.yyyy;
    req.session.user.username;
    var date = dd + '-' + mm + '-' + yyyy;
    var met = new metrics_1.Metric(date, req.body.quantity);
    console.log(met.date, met.value);
    dbMet.save1(met, req.session.user.username, function (err) {
        if (err)
            next(err);
        else {
            //res.status(201).send("metric persisted");
            console.log("user persisted");
            res.redirect('/metric/' + req.session.user.username);
        }
    });
});
app.use('/metric', metricRouter);
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
