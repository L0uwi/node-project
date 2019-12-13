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
        it('should get empty array or non existing group', function (done) {
            dbMet.get("0", function (err, result) {
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
                        chai_1.expect(result[0].value).to.be.equal(10);
                    done();
                });
            });
        });
    });
    /*describe('#delete', function () {
      

        it('should save and get', function (done) {
            let metrics: Metric[] = []
            metrics.push(new Metric('12345678', 10))
            dbMet.save("1", metrics, function (err: Error | null, result?: Metric[]) {
                dbMet.delete("1", metrics,function (err: Error | null, result?: Metric[]){

                    dbMet.get("1", function (err: Error | null, result?: Metric[]) {
                        expect(err).to.be.null
                        expect(result).to.not.be.undefined
                        expect(result).to.be.empty
                        if(result)
                            expect(result[0].value).to.be.equal(10)
                        done()
                    })

                } )
                    
            })
        })
    })*/
});
