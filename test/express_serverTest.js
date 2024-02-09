const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

chai.use(chaiHttp);

describe("Login and Access Control Test", () => {
  const agent = chai.request.agent("http://localhost:8080");
  it('should return 403 status code for unauthorized access to "http://localhost:3000/urls/b2xVn2"', () => {

    // Step 1: Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "user2@example.com", password: "dishwasher-funk" })
      .then((loginRes) => {
        // Step 2: Make a GET request to a protected resource
        return agent.get("/urls/b2xVn2").then((accessRes) => {
          // Step 3: Expect the status code to be 403
          expect(accessRes).to.have.status(403);
        });
      });
  });
    
  it('should return status code 404 for non-existing URL', function() {
    return agent
      .get('/urls/NOTEXISTS')
      .then(function(res) {
        expect(res).to.have.status(404);
      });
  });

  it('should clear session cookie and redirect to login page', function() {
    return agent
      .post('/logout')
      .then(function(res) {
        // Assert that logout was successful (redirected to login page)
        expect(res).to.redirectTo('http://localhost:8080/login');
          
      });
  });

  it('should redirect to login page with status code 302', () => {
    return agent
      .get('/')
      .then((res) => {
        // Assert redirection status code
        expect(res).to.redirectTo('http://localhost:8080/login');

      });
  });

  it('should redirect to login page with status code 302', function() {
    return agent
      .get('/urls/new')
      .then(function(res) {
        // Assert redirection status code
        expect(res).to.redirectTo('http://localhost:8080/login');
      });
  });


  it('should return status code 403 for unauthorized access', function() {
    return agent
      .get('/urls/b2xVn2')
      .then(function(res) {
        // Assert that the response has status code 403
        expect(res).to.have.status(403);
      });
  });
});
