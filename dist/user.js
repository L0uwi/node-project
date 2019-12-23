"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var leveldb_1 = require("./leveldb");
var User = /** @class */ (function () {
    //Constructor
    function User(username, email, password, passwordHashed) {
        if (passwordHashed === void 0) { passwordHashed = false; }
        this.password = "";
        this.username = username;
        this.email = email;
        if (!passwordHashed) {
            this.setPassword(password);
        }
        else
            this.password = password;
    }
    //Get data and returns it as an User object 
    User.fromDb = function (username, value) {
        var _a = value.split(":"), password = _a[0], email = _a[1];
        return new User(username, email, password);
    };
    //Set the password
    User.prototype.setPassword = function (toSet) {
        // Hash and set password
        this.password = toSet;
    };
    //Return Password
    User.prototype.getPassword = function () {
        return this.password;
    };
    //Validate if password given is the same as user's password
    User.prototype.validatePassword = function (toValidate) {
        // return comparison with hashed password
        return this.password == toValidate;
    };
    return User;
}());
exports.User = User;
//Definition of UserHandler class (used in server.ts)
var UserHandler = /** @class */ (function () {
    //Initialization of DB
    function UserHandler(path) {
        this.db = leveldb_1.LevelDB.open(path);
    }
    UserHandler.prototype.closeDB = function () {
        this.db.close();
    };
    //Return data from db using the given username (used in server.ts for the connexion)
    UserHandler.prototype.get = function (username, callback) {
        this.db.get("user:" + username, function (err, data) {
            if (err)
                callback(err);
            else if (data === undefined)
                callback(null, data);
            else {
                callback(null, User.fromDb(username, data));
            }
        });
    };
    //Save data to db (password and mail are in the same string so we need to use split we we read them)
    UserHandler.prototype.save = function (user, callback) {
        this.db.put("user:" + user.username, user.getPassword() + ":" + user.email, function (err) {
            callback(err);
        });
    };
    //Delete data from db
    UserHandler.prototype.delete = function (username, callback) {
        var key = username;
        this.db.del(key, function (err) {
            callback(err);
        });
    };
    //Validate if password given is the same as confirm password
    UserHandler.prototype.confirmPassword = function (password, confirmPassword) {
        // return comparison with hashed password
        return password == confirmPassword;
    };
    //Validate if mail given is the same as confirm mail
    UserHandler.prototype.confirmMail = function (mail, confirmMail) {
        // return comparison with hashed password
        return mail == confirmMail;
    };
    return UserHandler;
}());
exports.UserHandler = UserHandler;
