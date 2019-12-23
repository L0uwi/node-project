"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var metrics_1 = require("./metrics");
var leveldb_1 = require("./leveldb");
var dbPath = 'db_test_metrics';
var dbMet;
describe('Metrics', function () {
    before(function () {
        leveldb_1.LevelDB.clear(dbPath);
        dbMet = new metrics_1.MetricsHandler(dbPath);
    });
    after(function () {
        dbMet.closeDB();
    });
    describe('#get', function () {
        it('should get empty array on non existing group', function (done) {
            dbMet.get("1", function (err, result) {
                chai_1.expect(err).to.be.null;
                chai_1.expect(result).to.not.be.undefined;
                chai_1.expect(result).to.be.empty;
                done();
            });
        });
        it('should save and get', function (done) {
            var metrics = [];
            metrics.push(new metrics_1.Metric('12345678', 10));
            dbMet.save("1", metrics, function (err) {
                dbMet.get("1", function (err, result) {
                    chai_1.expect(err).to.be.null;
                    chai_1.expect(result).to.not.be.undefined;
                    chai_1.expect(result).to.not.be.empty;
                    if (result)
                        chai_1.expect(result[0].value).to.equal(10);
                    done();
                });
            });
        });
        //for delete => save, delete and get again -> if we get nothing it works
    });
});
