import { expect } from 'chai'
import { Metric, MetricsHandler } from './metrics'
import { LevelDB } from "./leveldb"

const dbPath: string = 'db_test'
var dbMet: MetricsHandler

describe('Metrics', function () {
    before(function () {
        LevelDB.clear(dbPath)
        dbMet = new MetricsHandler(dbPath)
    })

    after(function () {
        dbMet.closeDB()
    })

    describe('#Metrics tests', function () {
        it('should get empty array on non existing group', function (done) {
            dbMet.get1("1", function (err: Error | null, result?: Metric[]) {
                expect(err).to.be.null
                expect(result).to.not.be.undefined
                expect(result).to.be.empty
                done()
            })
        })

        it('should save (receiving a key and a metrics array in parameters) and get an array of metrics', function (done) {
            let metrics: Metric[] = []
            metrics.push(new Metric('12345678', 10))
            metrics.push(new Metric('22112233', 8))
            dbMet.save("1", metrics, function (err: Error | null) {
                dbMet.get1("1", function (err: Error | null, result?: Metric[]) {
                    expect(err).to.be.null
                    expect(result).to.not.be.undefined
                    expect(result).to.not.be.empty
                    expect(result).to.have.lengthOf(2)
                    if(result)
                        expect(result[0].value).to.equal(10),
                        expect(result[1].value).to.equal(8),
                        expect(result[1].date).to.equal('22112233'),  
                        expect(result[0].date).to.equal('12345678')                     
                    done()
                })
            })
        })

        it('should delete the metrics in the array', function (done) {
            dbMet.del("12345678", "1", function (err: Error | null) {
                dbMet.get2("1:12345678", function (err: Error | null, result?: Metric) {
                    expect(err).to.be.null
                    expect(result).to.be.undefined                     
                })
            })
            dbMet.del("22112233", "1", function (err: Error | null) {
                dbMet.get2("1:22112233", function (err: Error | null, result?: Metric) {
                    expect(err).to.be.null
                    expect(result).to.be.undefined                     
                })
            })
            done()
        })

        it('should save (receiving a key and one metric in parameters) and get one metric', function (done) {
            let metrics: Metric = new Metric("12345", 10)
            let user = "userTest"
            dbMet.save1(metrics, user, function (err: Error | null) {
                dbMet.get2(user+":"+metrics.date, function (err: Error | null, result?: Metric) {
                    expect(err).to.be.null
                    expect(result).to.not.be.undefined
                    if(result)
                        expect(result.value).to.equal(10),
                        expect(result.date).to.equal("12345")
                    done()
                })
            })
        })

        it('should overwrite the previous metric in the database', function (done) {
            let metrics: Metric = new Metric("12345", 2)
            let user = "userTest"
            dbMet.save1(metrics, user, function (err: Error | null) {
                dbMet.get2(user+":"+metrics.date, function (err: Error | null, result?: Metric) {
                    expect(err).to.be.null
                    expect(result).to.not.be.undefined
                    if(result)
                        expect(result.value).to.equal(2),
                        expect(result.date).to.equal("12345")
                })
            })
            done()
        })

        //for delete => save, delete and get again -> if we get nothing it works
    })
})