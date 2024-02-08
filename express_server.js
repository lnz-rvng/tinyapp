const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers');
const { urlDatabase, users } = require('./database');
const app = express();
const PORT = 8080;

// connects to the port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`); // keeps track of what port we're connected
});

app.use(cookieSession({
  name: 'session',
  keys: ['secret'],
}));

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
  const id = req.session.user_id;
  if (!id) {
    return res.status(401).send('Log in/Register first!')
  }

  const user = users[id];
  const userURLs = urlsForUser(id);
  const templateVars = {
    urls: userURLs,
    user: user
  };

  res.render('urls_index', templateVars);
});

// added a GET route to show the form
app.get('/urls/new', (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const templateVars = {
    user: user
  };

  if (!id) {
    return res.redirect('/login')
  }
  res.render('urls_new', templateVars);
});

// Added a second route and template
app.get('/urls/:id', (req, res) => {
  const id = req.session.user_id;
  const shortURL = req.params.id;
  const user = users[id];
  // Check if user is logged in
  if (!id) {
    return res.status(401).send('Log in/Register first!');
  }

  // Check if the requested URL exists
  if (!urlDatabase[shortURL]) {
    return res.status(404).send('URL not found');
  }

  // Check if the requested URL belongs to the logged-in user
  if (urlDatabase[shortURL].userID !== id) {
    return res.status(403).send('Unauthorized');
  }

  const templateVars = {
    id: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: user
  };

  res.render('urls_show', templateVars);
});

// Added a POST route to receive the form submission
app.post('/urls', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(401).send('You must be logged in to shorten URLs');
  }

  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`);
});

// redirect short URLs
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  console.log(shortURL)
  console.log(urlDatabase)
  
  if (!shortURL) {
    return res.status(404).send('ID does not exist');
  }

  if (!urlDatabase[shortURL]) {
    return res.status(404).send('404 not found');
  }
  
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// POST route that removes a URL
app.post('/urls/:id/delete', (req, res) => {
  const id = req.session.user_id;
  const shortURL = req.params.id;

  if (!shortURL) {
    return res.status(404).send('ID does not exist');
  }

  if (!id) {
    return res.status(401).send('User is not logged in');
  }

  if (urlDatabase[shortURL].userID !== id) {
    return res.status(403).send('Unauthorized');
  }

  if (urlDatabase[shortURL].longURL) {
    delete urlDatabase[shortURL];
    return res.redirect('/urls');
  }
});

// POST route that updates a URL
app.post('/urls/:id', (req, res) => {
  const id = req.session.user_id;
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;

  if (!id) {
    return res.status(401).send('User is not logged in');
  }

  if (!shortURL) {
    return res.status(404).send('ID does not exist');
  }

  if (urlDatabase[shortURL].userID !== id) {
    return res.status(403).send('Unauthorized');
  }

  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect('/urls');
  
});

// Login page get route
app.get('/login', (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const templateVars = {
    user: user
  };

  if (id) {
    return res.redirect('/urls');
  }

  res.render('login', templateVars);
});

// The Login Route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  if (!email || !password) {
    return res.status(400).send('Please provide an email/password');
  }

  if (!user || !bcrypt.compareSync(password, user.hashedPassword)) {
    return res.status(403).send('Invalid email/password');
  }

  req.session.user_id = user.id // set the userRandomID cookie
  res.redirect('/urls');
});

// logout route
app.post('/logout', (req, res) => {
  req.session = null; // clears/deletes the userRandomID cookie
  res.redirect('/login');
});

// registration route
app.get('/register', (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const templateVars = {
    user: user
  };

  if (id) {
    return res.redirect('/urls');
  }

  res.render('register', templateVars);
});

// post route to handle registration
app.post('/register', (req, res) => {
  const { email, password} = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10) 
  if (!email || !password) {
    return res.status(400).send('Please provide an email and a password');
  }
  
  const existingUser = getUserByEmail(email);
  if (existingUser) {
    return res.status(400).send('Email already exist');
  }
  
  const id = generateRandomString();
  const user = { id, email, hashedPassword };
  
  users[id] = user;
  console.log(users);
  req.session.user_id = id;
  res.redirect('/urls');
});


