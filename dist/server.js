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
//defining dbMet as MetricsHandler (see: metrics.ts file)
var dbMet = new metrics_1.MetricsHandler('./db/metrics');
//rendering hello.ejs (views folder)
app.get('/hello/:name', function (req, res) {
    res.render('index.ejs', { name: req.params.name });
});
//Get metrics from if retreived from URL
app.get('/metrics/:id', function (req, res) {
    dbMet.get(req.params.id, function (err, result) {
        if (err)
            throw err;
        res.json(result);
    });
});
//Save metrics to db
app.post('/metrics/:id', function (req, res) {
    dbMet.save(req.params.id, req.body, function (err) {
        if (err)
            throw err;
        res.status(200).send();
    });
});
//Running the server
app.listen(port, function (err) {
    if (err)
        throw err;
    console.log("Server is running on http://localhost:" + port);
});
//Open a levelDB Session, see documentation: https://github.com/maxogden/node-level-session
var session = require("express-session");
var levelSession = require("level-session-store");
var LevelStore = levelSession(session);
app.use(session({
    secret: 'my very secret phrase',
    store: new LevelStore('./db/sessions'),
    resave: true,
    saveUninitialized: true
}));
//USER
var user_1 = require("./user");
var dbUser = new user_1.UserHandler('./db/users');
var authRouter = express.Router();
app.use(authRouter);
//source: https://medium.com/@kongruksiamza/nodejs-validate-data-and-alert-message-in-ejs-template-engine-f2844a4cb255
var _a = require('express-validator'), check = _a.check, validationResult = _a.validationResult;
//Routing to login
authRouter.get('/login', function (req, res) {
    res.render('login');
});
//Routing to signup
authRouter.get('/signup', function (req, res) {
    res.render('signup', { err: null });
});
//Routing to logout
authRouter.get('/logout', function (req, res) {
    delete req.session.loggedIn;
    delete req.session.user;
    res.redirect('/login');
});
//Function used to redirect to login if username incorrect or connect if ok
authRouter.post('/login', function (req, res, next) {
    dbUser.get(req.body.username, function (err, result) {
        if (err)
            next(err);
        if (result === undefined || !result.validatePassword(req.body.password)) {
            res.redirect('/login');
        }
        else {
            req.session.loggedIn = true;
            req.session.user = result;
            res.redirect('/');
        }
    });
});
authRouter.post('/signup', [
    check('mail', 'email is required').isEmail(),
    check('password', 'password has to be longer than five characters').isLength({ min: 5 })
], function (req, res, next) {
    //Uses User get function (see user.ts line 55)
    dbUser.get(req.body.username, function (err, result) {
        //check validate data
        var resu = validationResult(req);
        var errors = resu.errors;
        if (!dbUser.confirmMail(req.body.mail, req.body.confirm_mail)) {
            errors.push({ value: 'confirm mail',
                msg: 'Mail and confirm mail are not identical',
                param: 'mail',
                location: 'body' });
        }
        if (!dbUser.confirmPassword(req.body.password, req.body.confirm_password)) {
            errors.push({ value: 'confirm password',
                msg: 'Password and confirm password are not identical',
                param: 'password',
                location: 'body' });
        }
        //If return value different from undifined, the user already exists
        if (!err || result !== undefined) {
            errors.push({ value: 'exists',
                msg: 'This user already exists !',
                param: 'username',
                location: 'body' });
        }
        if (!resu.isEmpty() /*|| errors.length !=0*/) {
            res.status(409).render('signup', { err: errors });
        }
        else {
            //Else, we add it to the database
            var user = new user_1.User(req.body.username, req.body.mail, req.body.password);
            dbUser.save(user, function (err) {
                if (err)
                    next(err);
                //Respond that the add is successfull
                else
                    res.status(200).redirect('/login');
            });
        }
    });
});
var userRouter = express.Router();
//Used to store data of user in database, Aknowledges if User exists already or if add successfull
userRouter.post('/', function (req, res, next) {
    //Uses User get function (see user.ts line 55)
    dbUser.get(req.body.username, function (err, result) {
        //If return value different from undifined, the user already exists
        if (!err || result !== undefined) {
            res.status(409).send("user already exists");
        }
        else {
            //Else, we add it to the database
            var user = new user_1.User(req.body.username, req.body.email, req.body.password);
            dbUser.save(user, function (err) {
                if (err)
                    next(err);
                //Respond that the add is successfull
                else
                    res.status(201).send("user persisted");
            });
        }
    });
});
//Used to store data of user in database, Aknowledges if User exists already or if add successfull
userRouter.delete('/:username', function (req, res, next) {
    //Uses User get function (see user.ts line 55)
    dbUser.delete(req.params.username, function (err, result) {
        if (!err) {
            res.status(200).send("user successfully deleted");
        }
        else {
            res.status(400).send("an error occured");
        }
    });
});
//Get value from User db
userRouter.get('/:username', function (req, res, next) {
    dbUser.get(req.params.username, function (err, result) {
        if (err || result === undefined) {
            res.status(404).send("user not found");
        }
        else
            res.status(200).json(result);
    });
});
app.use('/user', userRouter);
//Routing depending on logginedIn value
var authCheck = function (req, res, next) {
    if (req.session.loggedIn) {
        next();
    }
    else
        res.redirect('/login');
};
//Routing to main page, calls authCheck to verify that user is loggedIn
app.get('/', authCheck, function (req, res) {
    res.render('index', { name: req.session.username });
});
module.exports = app;
