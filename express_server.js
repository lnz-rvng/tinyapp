const express = require('express');
const app = express()
const PORT = 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

app.get('/', (req, res) => {
  res.send('Hello!')
})

// added routes
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase)
})

// connects to the port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`) // keeps track of what port we're connected
})