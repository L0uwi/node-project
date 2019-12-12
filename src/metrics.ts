import {LevelDB} from './leveldb'
import WriteStream from 'level-ws'

export class Metric {
  public timestamp: string
  public value: number

  constructor(ts: string, v: number) {
    this.timestamp = ts
    this.value = v
  }
}

export class MetricsHandler {

  private db: any 

  constructor(dbPath: string) {
    this.db = LevelDB.open(dbPath)
  }
  
  static get(callback: (error: Error | null, result?: Metric[]) => void) {
    const result = [
      new Metric('2013-11-04 14:00 UTC', 12),
      new Metric('2013-11-04 14:30 UTC', 15)
    ]
    callback(null, result)
  }

    public save(key: number, metrics: Metric[], callback: (error: Error | null) => void) {
      const stream = WriteStream(this.db)
      stream.on('error', callback)
      stream.on('close', callback)
      metrics.forEach((m: Metric) => {
        stream.write({ key: `metric:${key}${m.timestamp}`, value: m.value })
      })
      console.log(metrics)
      stream.end()
  }

  public getAll(key: number, callback: ( error: Error | null, result: Metric[] | null) => void) {
    this.db.createReadStream().on('data', function (data) {
      console.log(data.key, '=', data.value)
      callback(null)
    })
    .on('error', function (err) {
      console.log('Oh my', err)
    })
    .on('close', function (){
      console.log('Stream closed')
    })
    .on('end', function (){
      console.log('Stream ended')
    })
  }

}

