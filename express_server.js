const express = require('express');
const app = express()
const PORT = 8080

// setting ejs as the view engine
app.set('view engine', 'ejs')

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

app.get('/', (req, res) => {
  res.send('Hello!')
})

// added route - /urls.json
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase)
})

// added a new route = /hello
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n')
})

// connects to the port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`) // keeps track of what port we're connected
})