import { LevelDB } from "./leveldb"
//Doc for level-ws @: https://github.com/Level/level-ws
import WriteStream from 'level-ws'

//Definition of the Metric class (used line 37 below)
export class Metric {
  public timestamp: string
  public value: number

  constructor(ts: string, v: number) {
    this.timestamp = ts
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

  //Closing the db
  public closeDB(){
    this.db.close()
  }

  //saving to the DB
  public save(key: string, metrics: Metric[], callback: (error: Error | null) => void) {
    //Opening a stream to write in the db
    const stream = WriteStream(this.db)
    //Checking for errors
    stream.on('error', callback)
    stream.on('close', callback)
    //Writting the metrics inside the db
    metrics.forEach((m: Metric) => {
      stream.write({ key: `metric:${key}:${m.timestamp}`, value: m.value })
    })
    //Closing stream
    stream.end()
  }
  
  //Reading from the db
  public get(key: string, callback: (err: Error | null, result?: Metric[]) => void) {
    //Opening the reading stream
    const stream = this.db.createReadStream()
    //Creating new variable of Metric type to return values
    var met: Metric[] = []
    
    //Definition of the different cases 
    stream.on('error', callback)
      //on reading data..
      .on('data', (data: any) => {
        //??? 
        const [_, k, timestamp] = data.key.split(":")
        const value = data.value
        //if key asked different from k, no data found error
        if (key != k) {
          console.log(`LevelDB error: ${data} does not match key ${key}`)
        } else {
          //Else, we store the data in met variable
          met.push(new Metric(timestamp, value))
        }
      })
      .on('end', (err: Error) => {
        //Once finished, return value in callback
        callback(null, met)
      })
  }
}
