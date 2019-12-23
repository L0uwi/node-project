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
            stream.write({ key: key + ":" + m.date, value: m.value });
        });
        stream.end();
    };
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
    /*
    public get(key: string, callback: (err: Error | null, result?: Metric[]) => void) {
      const stream = this.db.createReadStream()
      var met: Metric[] = []
      stream.on('error', callback)
        .on('data', (data: any) => {
          const [user, date] = data.key.split(":")
          const value = data.value
          if (key != user) {
            console.log(`LevelDB error: ${data} does not match key ${key}`)
          } else {
            met.push(new Metric(date, value))
          }
        })
        .on('end', (err: Error) => {
          callback(null, met)
        })
    }*/
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
