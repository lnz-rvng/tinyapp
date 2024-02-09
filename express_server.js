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
  keys: ['abc', 'def', 'ghi'],
  maxAge: 24 * 60 * 60 * 1000 // 1 day
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set('view engine', 'ejs'); // setting ejs as the view engine

app.get('/', (req, res) => {
  const userID = req.session.user_id;

  if (!userID) {
    return res.redirect('/login');
  }

  res.redirect('/urls');
});

// added route - /urls.json
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// GET route to show the urls
app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  // check if you're logged in first
  if (!userID) {
    return res.status(403).send('Log in/Register first!');
  }

  const user = users[userID];
  const userURLs = urlsForUser(userID);
  const templateVars = {
    urls: userURLs,
    user: user
  };

  // if logged in, it will render the urls_index page
  res.render('urls_index', templateVars);
});

// GET route to show the submit a URL form
app.get('/urls/new', (req, res) => {
  const userID = req.session.user_id;
  // check if you're logged in first
  if (!userID) {
    return res.redirect('/login');
  }
  
  const user = users[userID];
  const templateVars = {
    user: user
  };
  // if logged in, it will render the urls_new page
  res.render('urls_new', templateVars);
});

// GET route to /urls/:id
app.get('/urls/:id', (req, res) => {
  const userID = req.session.user_id;
  // Check if user is logged in
  if (!userID) {
    return res.status(403).send('Log in/Register first!');
  }
  
  const shortURL = req.params.id;
  // Check if the requested URL exists - (req.params.id)
  if (!urlDatabase[shortURL]) {
    return res.status(404).send('URL not found');
  }

  if (urlDatabase[shortURL].userID !== userID) {
    return res.status(403).send('Unauthorized');
  }

  // Check if the requested URL belongs to the logged-in user

  const user = users[userID];
  const templateVars = {
    id: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: user
  };

  res.render('urls_show', templateVars);
});

// POST route to receive the form submission
app.post('/urls', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(403).send('You must be logged in to shorten URLs');
  }

  let longURL = req.body.longURL;

  // checks if the form submitted has an http protocol on it, if not, we append it on the start
  if (!longURL.includes('http')) {
    longURL = "http://" + longURL;
  }

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`);
});

// GET route to redirect original URL
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;

  // checks if the shortURL exist in teh database
  if (!urlDatabase[shortURL]) {
    return res.status(404).send('404 not found');
  }
  
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// POST route that removes/deletes a URL
app.post('/urls/:id/delete', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(403).send('User is not logged in');
  }
  
  const shortURL = req.params.id;
  if (!shortURL) {
    return res.status(404).send('ID does not exist');
  }


  if (urlDatabase[shortURL].userID !== userID) {
    return res.status(403).send('Unauthorized');
  }

  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// POST route that updates a URL
app.post('/urls/:id', (req, res) => {
  const userID = req.session.user_id;
  // check if a user is logged in
  if (!userID) {
    return res.status(403).send('User is not logged in');
  }

  const shortURL = req.params.id;
  // check if the URL exists
  if (!shortURL) {
    return res.status(404).send('ID does not exist');
  }

  if (urlDatabase[shortURL].userID !== userID) {
    return res.status(403).send('Unauthorized');
  }

  let newLongURL = req.body.longURL;
  // checks if the form submitted has an http protocol on it, if not, we append it on the start
  if (!newLongURL.includes('http')) {
    newLongURL = "http://" + newLongURL;
  }

  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect('/urls');
});

// Login page get route
app.get('/login', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = {
    user: user
  };

  if (userID) {
    return res.redirect('/urls');
  }

  res.render('login', templateVars);
});

// POST route for logging in
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check if you provided an email or a password on the form
  if (!email || !password) {
    return res.status(400).send('Please provide an email/password');
  }

  const user = getUserByEmail(email, users);

  // Checks wether you inputted a valid email or a password
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(403).send('Invalid email/password');
  }

  req.session.user_id = user.id; // set the userRandomID cookie
  res.redirect('/urls');
});

// POST route for logging out
app.post('/logout', (req, res) => {
  req.session = null; // clears/deletes the userRandomID cookie
  res.redirect('/login');
});

// GET route to the registration form
app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = {
    user: user
  };

  // automatically logged you in after a succesful registration
  if (userID) {
    return res.redirect('/urls');
  }

  res.render('register', templateVars);
});

// POST route to handle registration
app.post('/register', (req, res) => {
  const { email, password} = req.body;

  if (!email || !password) {
    return res.status(400).send('Please provide an email and a password');
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const existingUser = getUserByEmail(email, users);

  // check if the email already exist
  if (existingUser) {
    return res.status(400).send('Email already exist');
  }
  
  // generate some random strings to set as cookie
  const userID = generateRandomString();
  const user = { id: userID, email, password: hashedPassword };
  
  users[userID] = user;

  req.session.user_id = userID; // setting the cookie
  res.redirect('/urls');
});


