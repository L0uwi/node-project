import { Metric, MetricsHandler } from '../src/metrics'

const met = [
  new Metric("01/01/2019", 10),
  new Metric("02/01/2019", 3),
  new Metric("03/01/2019", 8),
  new Metric("04/01/2019", 10),
  new Metric("05/01/2019", 10),
  new Metric("06/01/2019", 10),
  new Metric("07/01/2019", 7)
]

const db = new MetricsHandler('./db/metrics')

db.save('barney47', met, (err: Error | null) => {
  if (err) throw err
  console.log('Data populated')
})
