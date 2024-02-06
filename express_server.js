const express = require('express');
const cookieParser = require('cookie-parser');
const { generateRandomString, getUserByEmail } = require('./helpers');
const { urlDatabase, users } = require('./database');
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
  const id = req.cookies.user_id;
  const user = users[id];
  const templateVars = {
    urls: urlDatabase,
    user: user
  };

  res.render('urls_index', templateVars);
});

// added a GET route to show the form
app.get('/urls/new', (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];
  const templateVars = {
    user: user
  };

  res.render('urls_new', templateVars);
});

// Added a second route and template
app.get('/urls/:id', (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: user
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
  if (!longURL) {
    res.statusCode = 404;
    return res.send('URL not found');
  }
  res.redirect(longURL);
});

// POST route that removes a URL
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id]) {
    delete urlDatabase[id];
    return res.redirect('/urls');
  }
});

// POST route that updates a URL
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  if (urlDatabase[id]) {
    urlDatabase[id] = newLongURL;
    return res.redirect('/urls');
  }
});

// Login page get route
app.get('/login', (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];
  const templateVars = {
    user: user
  };
  res.render('login', templateVars);
});

// The Login Route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  if (!email || !password) {
    return res.status(400).send('Please provide an email/password');
  }

  if (!user || user.password !== password) {
    return res.status(403).send('Invalid email/password');
  }

  res.cookie('user_id', user.id); // set the userRandomID cookie
  res.redirect('/urls');
});

// logout route
app.post('/logout', (req, res) => {
  res.clearCookie('user_id'); // clears/deletes the userRandomID cookie
  res.redirect('/login');
});

// registration route
app.get('/register', (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];
  const templateVars = {
    user: user
  };
  res.render('register', templateVars);
});

// post route to handle registration
app.post('/register', (req, res) => {
  const { email, password} = req.body;
  if (!email || !password) {
    return res.status(400).send('Please provide an email and a password');
  }
  
  const existingUser = getUserByEmail(email);
  if (existingUser) {
    return res.status(400).send('Email already exist');
  }
  
  const id = generateRandomString();
  const user = { id, email, password };
  
  users[id] = user;
  console.log(users);
  res.cookie('user_id', id);
  res.redirect('/urls');
});

