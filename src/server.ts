import express = require('express')
import { MetricsHandler } from './metrics'
import path = require('path')
import bodyparser= require('body-parser')


const app = express()
const port: string = process.env.PORT || '8082'
app.use(express.static(path.join(__dirname, '/../public')))


app.set('views', __dirname + "/../views")
app.set('view engine', 'ejs');

app.use(bodyparser.json())
app.use(bodyparser.urlencoded())


app.get('/', (req: any, res: any) => {
  res.write('Hello world')
  res.end()
})

app.get('/hello/:name', (req: any, res: any) => {
  res.render('hello.ejs', {name: req.params.name})
})

const dbMet: MetricsHandler = new MetricsHandler('./db/metrics')

app.post('/metrics/:id', (req: any, res: any) => {
  dbMet.save(req.params.id, req.body, (err: Error | null) => {
    if (err) throw err
    res.status(200).send('oké')
  })
})

app.get('/metrics.json', (req: any, res: any) => {
  MetricsHandler.get((err: Error | null, result?: any) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
})

app.listen(port, (err: Error) => {
  if (err) {
    throw err
  }
  console.log(`Server is running on http://localhost:${port}`)
})
