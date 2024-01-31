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

// added a new route handler for urls
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase }
  res.render('urls_index', templateVars)
})

// Added a second route and template
app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] }
  res.render('urls_show', templateVars)
})

// connects to the port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`) // keeps track of what port we're connected
})