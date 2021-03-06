const express = require('express')
const app = express()
const port = 3000
const formidable = require('formidable')

const { Pool } = require('pg')
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'fileranch',
  password: null,
  port: 5432,
})


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
app.get('/favicon.ico', function(req, res){
  res.sendFile(__dirname + '/favicon.ico');
});
app.get('/apple-touch-icon.png', function(req, res){
  res.sendFile(__dirname + '/apple-touch-icon.png');
});
app.get('/favicon-32x32.png', function(req, res){
  res.sendFile(__dirname + '/favicon-32x32.png');
});
app.get('/favicon-16x16.png', function(req, res){
  res.sendFile(__dirname + '/favicon-16x16.png');
});
app.get('/site.webmanifest', function(req, res){
  res.sendFile(__dirname + '/site.webmanifest');
});
app.get('/canvas.js', function(req, res){
  res.sendFile(__dirname + '/canvas.js');
});
app.get('/p5.start2d.js', function(req, res){
  res.sendFile(__dirname + '/p5.start2d.js');
});
app.get('/file', function(req, res) {
  res.send()
})
app.post('/text', function(req, res) {
    console.log('added text', req.query.text);
    const text = 'INSERT INTO text(x, y, text) VALUES($1, $2, $3) RETURNING *'
    const x = Math.floor(parseInt(req.query.x, 10));
    const y = Math.floor(parseInt(req.query.y, 10));
    const values = [x, y, req.query.text]
    pool.query(text, values)
      .then(pic => {
        res.send(pic.rows[0])
      })
      .catch(e => console.error(e.stack));
})
app.post('/file', function(req, res) {
  new formidable.IncomingForm().parse(req)
    .on('fileBegin', (name, file) => {
        file.path = '/usr/local/var/fileranch/' + file.name
    })
    .on('file', (name, file) => {
      console.log('Uploaded file', file.name)
      const text = 'INSERT INTO files(x, y, file) VALUES($1, $2, $3) RETURNING *'
      const x = Math.floor(parseInt(req.query.x, 10));
      const y = Math.floor(parseInt(req.query.y, 10));
      const values = [x, y, file.name]
      pool.query(text, values)
        .then(pic => {
          res.send(pic.rows[0])
        })
        .catch(e => console.error(e.stack));
    })
})

app.get('/square', function(req, res) {
  const xMin = Math.floor(parseInt(req.query.xMin, 10));
  const xMax = Math.floor(parseInt(req.query.xMax, 10));
  const yMin = Math.floor(parseInt(req.query.yMin, 10));
  const yMax = Math.floor(parseInt(req.query.yMax, 10));
  const text = 'SELECT * FROM files WHERE x BETWEEN $1 AND $2 AND y  BETWEEN $3 AND $4';
  const values = [xMin, xMax, yMin, yMax];
  pool.query(text, values)
  .then(fileRows => {
    const text = 'SELECT * FROM text WHERE x BETWEEN $1 AND $2 AND y  BETWEEN $3 AND $4';
    const values = [xMin, xMax, yMin, yMax];
    pool.query(text, values)
    .then(textRows => {
      res.send({files: fileRows.rows, text: textRows.rows})
    })
  })
  .catch(e => console.error(e.stack));
})

app.use('/files', express.static('/usr/local/var/fileranch/'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
