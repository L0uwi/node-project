import { LevelDB } from "./leveldb"
import WriteStream from 'level-ws'
import { User } from "./user"

export class Metric {
  public date: string
  public value: number

  constructor(dt: string, v: number) {
    this.date = dt
    this.value = v
  }
}

export class MetricsHandler {
  private db: any 
  
  constructor(dbPath: string) {
    this.db = LevelDB.open(dbPath)
  }

  public closeDB(){
    this.db.close()
  }
  
  public save(key: string, metrics: Metric[], callback: (error: Error | null) => void) {
    const stream = WriteStream(this.db)
    stream.on('error', callback)
    stream.on('close', callback)
    metrics.forEach((m: Metric) => {
      stream.write({ key: `metric:${key}:${m.date}`, value: m.value })
    })
    stream.end()
  }
  
  public save1(metric: Metric, user: string, callback: (err: Error | null) => void) {
    this.db.put(`${user}:${metric.date}`, `${metric.value}`, (err: Error | null) => {
      callback(err)
    })
  }

  public del(date: string, username: string, callback: (err: Error | null) => void) {
    let key = username+':'+date
    this.db.del(key, (err: Error | null) => {
      callback(err)
    })
  }

  public get1(key: string, callback: (err: Error | null, result?: Metric[]) => void) {
    const stream = this.db.createReadStream()
    var met: Metric[] = []
    stream.on('error', callback)
      .on('data', (data: any) => {
        const [user, date] = data.key.split(":")
        const value = data.value        
        if (key != user) {
          console.log(`LevelDB error: ${user} does not match key ${key}`)
        } 
        else {
          met.push(new Metric(date, value))
        }
        console.log(data.key, '=', data.value)
      })
      .on('end', (err: Error) => {
        console.log("\n"+met)
        callback(null, met)
      })
  }

  public get(key: string, callback: (err: Error | null, result?: Metric[]) => void) {
    const stream = this.db.createReadStream()
    var met: Metric[] = []
    stream.on('error', callback)
      .on('data', (data: any) => {
        const [_, k, timestamp] = data.key.split(":")
        const value = data.value
        if (key != k) {
          console.log(`LevelDB error: ${data} does not match key ${key}`)
        } else {
          met.push(new Metric(timestamp, value))
        }
      })
      .on('end', (err: Error) => {
        callback(null, met)
      })
  }
}
