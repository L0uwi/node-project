"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var metrics_1 = require("./metrics");
var leveldb_1 = require("./leveldb");
var dbPath = 'db_test';
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
            dbMet.get1("1", function (err, result) {
                chai_1.expect(err).to.be.null;
                chai_1.expect(result).to.not.be.undefined;
                chai_1.expect(result).to.be.empty;
                done();
            });
        });
        it('should save (receiving a key and a metrics array) and get an array of metrics', function (done) {
            var metrics = [];
            metrics.push(new metrics_1.Metric('12345678', 10));
            metrics.push(new metrics_1.Metric('22112233', 8));
            dbMet.save("1", metrics, function (err) {
                dbMet.get1("1", function (err, result) {
                    chai_1.expect(err).to.be.null;
                    chai_1.expect(result).to.not.be.undefined;
                    chai_1.expect(result).to.not.be.empty;
                    chai_1.expect(result).to.have.lengthOf(2);
                    if (result)
                        chai_1.expect(result[0].value).to.equal(10),
                            chai_1.expect(result[1].value).to.equal(8),
                            chai_1.expect(result[1].date).to.equal('22112233'),
                            chai_1.expect(result[0].date).to.equal('12345678'),
                            done();
                });
            });
        });
        it('should save (receiving one metric and one key) and get one metric', function (done) {
            var metrics = new metrics_1.Metric('12345', 10);
            var user = "userTest";
            dbMet.save1(metrics, user, function (err) {
                dbMet.get2(user + metrics.date, function (err, result) {
                    chai_1.expect(err).to.be.null;
                    chai_1.expect(result).to.not.be.undefined;
                    if (result)
                        chai_1.expect(result.value).to.equal(10),
                            chai_1.expect(result.date).to.equal(12345);
                    done();
                });
            });
        });
        //for delete => save, delete and get again -> if we get nothing it works
    });
});
