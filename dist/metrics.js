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
    function Metric(ts, v) {
        this.timestamp = ts;
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
    //Closing the db
    MetricsHandler.prototype.closeDB = function () {
        this.db.close();
    };
    //saving to the DB
    MetricsHandler.prototype.save = function (key, metrics, callback) {
        //Opening a stream to write in the db
        var stream = level_ws_1.default(this.db);
        //Checking for errors
        stream.on('error', callback);
        stream.on('close', callback);
        //Writting the metrics inside the db
        metrics.forEach(function (m) {
            stream.write({ key: "metric:" + key + ":" + m.timestamp, value: m.value });
        });
        //Closing stream
        stream.end();
    };
    //Reading from the db
    MetricsHandler.prototype.get = function (key, callback) {
        //Opening the reading stream
        var stream = this.db.createReadStream();
        //Creating new variable of Metric type to return values
        var met = [];
        //Definition of the different cases 
        stream.on('error', callback)
            //on reading data..
            .on('data', function (data) {
            //??? 
            var _a = data.key.split(":"), _ = _a[0], k = _a[1], timestamp = _a[2];
            var value = data.value;
            //if key asked different from k, no data found error
            if (key != k) {
                console.log("LevelDB error: " + data + " does not match key " + key);
            }
            else {
                //Else, we store the data in met variable
                met.push(new Metric(timestamp, value));
            }
        })
            .on('end', function (err) {
            //Once finished, return value in callback
            callback(null, met);
        });
    };
    return MetricsHandler;
}());
exports.MetricsHandler = MetricsHandler;
