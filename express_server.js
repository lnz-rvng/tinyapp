const express = require('express');
const cookieParser = require('cookie-parser');
const { generateRandomString } = require('./randomString');
const { urlDatabase } = require('./database');
const app = express();
const PORT = 8080;

// connects to the port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`); // keeps track of what port we're connected
});

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs'); // setting ejs as the view engine

app.get('/', (req, res) => {
  res.send('Hello!');
});

// added route - /urls.json
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// added a new route = /hello
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

// added a new route handler for urls
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };

  res.render('urls_index', templateVars);
});

// added a GET route to show the form
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };

  res.render('urls_new', templateVars);
});

// Added a second route and template
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
  };

  res.render('urls_show', templateVars);
});

// Added a POST route to receive the form submission
app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// redirect short URLs
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.statusCode = 404;
    res.send('URL not found');
  }
});

// POST route that removes a URL
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id]) {
    delete urlDatabase[id];
    res.redirect('/urls');
    return;
  }
});

// POST route that updates a URL
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  if (urlDatabase[id]) {
    urlDatabase[id] = newLongURL;
    res.redirect('/urls');
    return;
  }
});

// The Login Route
app.post('/login', (req, res) => {
  const { username } = req.body;
  if (username) {
    res.cookie('username', username); // set the username cookie
    res.redirect('/urls');
  } else {
    res.status(400).send('Username is required');
  }
});

// logout route
app.post('/logout', (req, res) => {
  res.clearCookie('username'); // clears/deletes the username cookie
  res.redirect('/urls');
});

// registration route
app.get('/register', (req, res) => {
  res.render('register')
})