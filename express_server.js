const express = require('express');
const app = express();
const PORT = 8080;

// setting ejs as the view engine
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// generate a short random url id
const generateRandomString = () => {

  // Define the character set from which to generate the random string
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  // Initialize an empty string to store the random string
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    // Generate a random index within the range of the character set length
    const randomIndex = Math.floor(Math.random() * charset.length);
    randomString += charset[randomIndex];
  }
  return randomString;
};

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
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

// added a GET route to show the form
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

// Added a second route and template
app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render('urls_show', templateVars);
});

// Added a POST route to receive the form submission
app.post('/urls', (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok'
});

// connects to the port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`); // keeps track of what port we're connected
});