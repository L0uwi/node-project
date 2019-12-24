import { Metric, MetricsHandler } from '../src/metrics'
import { User, UserHandler } from '../src/user'

const met = [
  new Metric("2019-01-01", 10),
  new Metric("2019-01-02", 3),
  new Metric("2019-01-03", 8),
  new Metric("2019-01-04", 10),
  new Metric("2019-01-05", 9),
  new Metric("2019-01-06", 10),
  new Metric("2019-01-07", 7)
]

const db = new MetricsHandler('./db/metrics')

db.save('barney47', met, (err: Error | null) => {
  if (err) throw err
  console.log('Data populated')
})


const db2 = new UserHandler('./db/users')
let tempUser = new User("barney47","barney@gmail.com","waitforit",false);
db2.save(tempUser, (err: Error | null) => {
  if (err) throw err
  console.log("User populated")
})