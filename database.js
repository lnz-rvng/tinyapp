const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$5LUo1Or18uUK4DP0mHVHC.52ulxZCJBWyAfwirvNP9YJ9F49Zggu2", // purple-monkey-dinosaur
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$pPCOP6gM3PP8zmkzLq6qPelBDu1.3nYXEOG2ANQVu8DP4.rQpQjfq", // dishwasher-funk
  },
};


module.exports = { urlDatabase, users };