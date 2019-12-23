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
    describe('#Getting', function () {
        it('should get empty array on non existing group', function (done) {
            dbMet.get1("1", function (err, result) {
                chai_1.expect(err).to.be.null;
                chai_1.expect(result).to.not.be.undefined;
                chai_1.expect(result).to.be.empty;
                done();
            });
        });
    });
    describe('#Saving and deleting', function () {
        it('should save (receiving a key and a metrics array in parameters) and get an array of metrics', function (done) {
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
                            chai_1.expect(result[0].date).to.equal('12345678');
                    done();
                });
            });
        });
        it('should delete the metrics in the array', function (done) {
            dbMet.del("12345678", "1", function (err) {
                dbMet.get2("1:12345678", function (err, result) {
                    chai_1.expect(err).to.be.null;
                    chai_1.expect(result).to.be.undefined;
                });
            });
            dbMet.del("22112233", "1", function (err) {
                dbMet.get2("1:22112233", function (err, result) {
                    chai_1.expect(err).to.be.null;
                    chai_1.expect(result).to.be.undefined;
                });
            });
            done();
        });
        it('should save (receiving a key and one metric in parameters) and get one metric', function (done) {
            var metrics = new metrics_1.Metric("12345", 10);
            var user = "userTest";
            dbMet.save1(metrics, user, function (err) {
                dbMet.get2(user + ":" + metrics.date, function (err, result) {
                    chai_1.expect(err).to.be.null;
                    chai_1.expect(result).to.not.be.undefined;
                    if (result)
                        chai_1.expect(result.value).to.equal(10),
                            chai_1.expect(result.date).to.equal("12345");
                    done();
                });
            });
        });
        it('should overwrite the previous metric in the database', function (done) {
            var metrics = new metrics_1.Metric("12345", 2);
            var user = "userTest";
            dbMet.save1(metrics, user, function (err) {
                dbMet.get2(user + ":" + metrics.date, function (err, result) {
                    chai_1.expect(err).to.be.null;
                    chai_1.expect(result).to.not.be.undefined;
                    if (result)
                        chai_1.expect(result.value).to.equal(2),
                            chai_1.expect(result.date).to.equal("12345");
                });
            });
            done();
        });
    });
});
