"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var leveldb_1 = require("./leveldb");
//Doc for level-ws @: https://github.com/Level/level-ws
var level_ws_1 = __importDefault(require("level-ws"));
//Definition of the Metric class (used line 37 below)
var Metric = /** @class */ (function () {
    function Metric(dt, v) {
        this.date = dt;
        this.value = v;
    }
    return Metric;
}());
exports.Metric = Metric;
//Definition of MetricsHandler class (used in server.ts line 17)
var MetricsHandler = /** @class */ (function () {
    //Opening the db with the path of the desired db (dbPath)
    function MetricsHandler(dbPath) {
        this.db = leveldb_1.LevelDB.open(dbPath);
    }
    MetricsHandler.prototype.closeDB = function () {
        this.db.close();
    };
    //saving method: receive a username and an array of metrics.
    //The key in the db is based on 'username:date'
    MetricsHandler.prototype.save = function (user, metrics, callback) {
        var stream = level_ws_1.default(this.db);
        //Checking for errors
        stream.on('error', callback);
        stream.on('close', callback);
        //Writting the metrics inside the db
        metrics.forEach(function (m) {
            stream.write({ key: user + ":" + m.date, value: m.value });
        });
        //Closing stream
        stream.end();
    };
    //second saving method: receive a username and only one metric
    MetricsHandler.prototype.save1 = function (metric, user, callback) {
        /*this.db.put(`${user}:${metric.date}`, `${metric.value}`, (err: Error | null) => {
          callback(err)
        })*/
        var stream = level_ws_1.default(this.db);
        stream.on('error', callback);
        stream.on('close', callback);
        stream.write({ key: user + ":" + metric.date, value: metric.value });
        stream.end();
    };
    //deleting method: receive a date and a username
    MetricsHandler.prototype.del = function (date, username, callback) {
        var key = username + ':' + date;
        this.db.del(key, function (err) {
            callback(err);
        });
    };
    //get method : receive a key (username) and retrieve all the metrics related
    MetricsHandler.prototype.get1 = function (key, callback) {
        var stream = this.db.createReadStream();
        var met = [];
        stream.on('error', callback)
            .on('data', function (data) {
            var _a = data.key.split(":"), user = _a[0], date = _a[1];
            var value = data.value;
            if (key != user) {
                console.log("LevelDB error: " + user + " does not match key " + key);
            }
            else {
                met.push(new Metric(date, value));
            }
            //console.log(data.key, '=', data.value)
        })
            .on('end', function (err) {
            callback(null, met);
        });
    };
    //second get method: receive a key ('username:date') and retrieve a special metric
    MetricsHandler.prototype.get2 = function (key, callback) {
        var stream = this.db.createReadStream();
        var met;
        stream.on('error', callback)
            .on('data', function (data) {
            var _a = data.key.split(":"), user = _a[0], date = _a[1];
            var value = data.value;
            if (key != data.key) {
                console.log("LevelDB error: " + data.key + " does not match key " + key);
            }
            else {
                met = new Metric(date, value);
            }
        })
            .on('end', function (err) {
            callback(null, met);
        });
    };
    return MetricsHandler;
}());
exports.MetricsHandler = MetricsHandler;
