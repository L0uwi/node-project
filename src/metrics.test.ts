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

    describe('#get', function () {
        it('should get empty array or non existing group', function (done) {
            dbMet.get("0", function (err: Error | null, result?: Metric[]) {
                expect(err).to.be.null
                expect(result).to.not.be.undefined
                expect(result).to.be.empty
                done()
            })
        })

        it('should save and get', function (done) {
            let metrics: Metric[] = []
            metrics.push(new Metric('12345678', 10))
            dbMet.save("1", metrics, function (err: Error | null) {
                dbMet.get("1", function (err: Error | null, result?: Metric[]) {
                    expect(err).to.be.null
                    expect(result).to.not.be.undefined
                    expect(result).to.not.be.empty
                    if(result)
                        expect(result[0].value).to.be.equal(10)
                    done()
                })
            })
        })
    })

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
})