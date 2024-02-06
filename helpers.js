const { users } = require('./database');

// generate a short random url id
const generateRandomString = () => {
  // Define the character set from which to generate the random string
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = ''; // Initialize an empty string to store the random string
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length); // Generate a random index within the range of the character set length
    randomString += charset[randomIndex];
  }
  return randomString;
};

// used for authentication
const getUserByEmail = (email) => {
  for (const userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  return null;
};

module.exports = { generateRandomString, getUserByEmail };