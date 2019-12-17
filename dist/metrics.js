"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var leveldb_1 = require("./leveldb");
var level_ws_1 = __importDefault(require("level-ws"));
var Metric = /** @class */ (function () {
    function Metric(dt, v) {
        this.date = dt;
        this.value = v;
    }
    return Metric;
}());
exports.Metric = Metric;
var MetricsHandler = /** @class */ (function () {
    function MetricsHandler(dbPath) {
        this.db = leveldb_1.LevelDB.open(dbPath);
    }
    MetricsHandler.prototype.closeDB = function () {
        this.db.close();
    };
    MetricsHandler.prototype.save = function (key, metrics, callback) {
        var stream = level_ws_1.default(this.db);
        stream.on('error', callback);
        stream.on('close', callback);
        metrics.forEach(function (m) {
            stream.write({ key: "metric:" + key + ":" + m.date, value: m.value });
        });
        stream.end();
    };
    MetricsHandler.prototype.save1 = function (metric, user, callback) {
        this.db.put(user + ":" + metric.date, "" + metric.value, function (err) {
            callback(err);
        });
    };
    MetricsHandler.prototype.del = function (date, username, callback) {
        var key = username + ':' + date;
        this.db.del(key, function (err) {
            callback(err);
        });
    };
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
            console.log(data.key, '=', data.value);
        })
            .on('end', function (err) {
            console.log("\n" + met);
            callback(null, met);
        });
    };
    MetricsHandler.prototype.get = function (key, callback) {
        var stream = this.db.createReadStream();
        var met = [];
        stream.on('error', callback)
            .on('data', function (data) {
            var _a = data.key.split(":"), _ = _a[0], k = _a[1], timestamp = _a[2];
            var value = data.value;
            if (key != k) {
                console.log("LevelDB error: " + data + " does not match key " + key);
            }
            else {
                met.push(new Metric(timestamp, value));
            }
        })
            .on('end', function (err) {
            callback(null, met);
        });
    };
    return MetricsHandler;
}());
exports.MetricsHandler = MetricsHandler;
