import { LevelDB } from "./leveldb"
//Doc for level-ws @: https://github.com/Level/level-ws
import WriteStream from 'level-ws'
import { User } from "./user"

//Definition of the Metric class (used line 37 below)
export class Metric {
  public date: string
  public value: number

  constructor(dt: string, v: number) {
    this.date = dt
    this.value = v
  }
}

//Definition of MetricsHandler class (used in server.ts line 17)
export class MetricsHandler {
  private db: any 

  //Opening the db with the path of the desired db (dbPath)
  constructor(dbPath: string) {
    this.db = LevelDB.open(dbPath)
  }

  public closeDB() {
    this.db.close()
  }


  //saving method: receive a username and an array of metrics.
  //The key in the db is based on 'username:date'
  public save(user: string, metrics: Metric[], callback: (error: Error | null) => void) {
    const stream = WriteStream(this.db)
    //Checking for errors
    stream.on('error', callback)
    stream.on('close', callback)
    //Writting the metrics inside the db
    metrics.forEach((m: Metric) => {
      stream.write({ key: `${user}:${m.date}`, value: m.value })
    })
    //Closing stream
    stream.end()
  }

  //second saving method: receive a username and only one metric
  public save1(metric: Metric, user: string, callback: (err: Error | null) => void) {
    /*this.db.put(`${user}:${metric.date}`, `${metric.value}`, (err: Error | null) => {
      callback(err)
    })*/
    const stream = WriteStream(this.db)
    stream.on('error', callback)
    stream.on('close', callback)
    stream.write({ key: `${user}:${metric.date}`, value: metric.value })
    stream.end()
  }


  //deleting method: receive a date and a username
  public del(date: string, username: string, callback: (err: Error | null) => void) {
    let key = username + ':' + date
    this.db.del(key, (err: Error | null) => {
      callback(err)
    })
  }

  //get method : receive a key (username) and retrieve all the metrics related
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
        //console.log(data.key, '=', data.value)
      })
      .on('end', (err: Error) => {
        callback(null, met)
      })
  }

  //second get method: receive a key ('username:date') and retrieve a special metric
  public get2(key: string, callback: (err: Error | null, result?: Metric) => void) {
    const stream = this.db.createReadStream()
    var met: Metric
    stream.on('error', callback)
      .on('data', (data: any) => {
        const [user, date] = data.key.split(":")
        const value = data.value
        if (key != data.key) {
          console.log(`LevelDB error: ${data.key} does not match key ${key}`)
        } else {
          met = new Metric(date, value)
        }
      })
      .on('end', (err: Error) => {
        callback(null, met)
      })
  }

   /*
  public get(key: string, callback: (err: Error | null, result?: Metric[]) => void) {
    //Opening the reading stream
    const stream = this.db.createReadStream()
    //Creating new variable of Metric type to return values
    var met: Metric[] = []
    stream.on('error', callback)
      //on reading data..
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
        //Once finished, return value in callback
        callback(null, met)
      })
  }*/
  
}