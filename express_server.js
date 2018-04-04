// Function to Generate a Random String for the User ID

function generateRandomString() {

var string = "";
var characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

for(var i = 0; i < 6; i++){
string += characters.charAt(Math.floor(Math.random() * characters.length));}

return string;

}

// Constants and Declarations

var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
const http = require("http");
const bcrypt = require('bcrypt');

// Using cookieSession to implement cookie storage

var cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  keys: [ 'key' ]
}));

// More Declarations

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")

app.listen(PORT, () => {
  (`Example app listening on port ${PORT}!`);
});


// Made user database and url database empty since we want to test registration
// features from the start

const users = {
 //  "userRandomID": {
 //    id: "userRandomID",
 //    email: "u@u.com",
 //    password: "u"
 //  },
 // "user2RandomID": {
 //    id: "user2RandomID",
 //    email: "z@z.com",
 //    password: "z"
 //  },
}

var urlDatabase = {
   //  "b2xVn2": {
   //    userID: "userRandomID",
   //    longURL: "http://www.lighthouselabs.ca"
   //  },
   // "9sm5xK": {
   //    userID: "user2RandomID",
   //    longURL: "http://www.google.com"
   //  }
};


// Shows specific URLs for the specified user ID

function urlsforuser(userID) {

  var obj = {};

  for(var shortURL in urlDatabase){
    var value = urlDatabase[shortURL];

    if(userID === value.userID){
      obj[shortURL] = value;
    }
  }
  return obj;
}


// Determines if a user is logged in

const isLoggedIn = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  next();
}


// Routes

app.get("/", isLoggedIn, (req, res) => {
  res.redirect("/urls")
});

app.get(".json", (req, res) => {
  res.json(urlDatabase);
});


// Redirects the user to the specified url

app.get("/u/:shortURL", (req, res, next) => {
  let urlObject = urlDatabase[req.params.shortURL]
  if(!urlObject){
    res.status(403).send("Invalid URL");
  } else {
  res.redirect(urlObject.longURL);
  }
});

app.get("/urls/new", isLoggedIn, (req, res) => {
  let templateVars = {user: req.session.user_id};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  var shortURL = req.params.id;
  var userURLs = urlsforuser(req.session.user_id);
  var urlObject = userURLs[shortURL];

  if(!urlObject){
    res.status(403).send("Incorrect URL")
  } else {
    let templateVars = {shortURL: req.params.id, longURL: urlObject.longURL, user: req.session.user_id};
    res.render("urls_show", templateVars);
  }

});

app.get("/urls", isLoggedIn, (req, res) => {
  let templateVars = {urls: urlsforuser(req.session.user_id), userID: req.session.user_id};
  res.render("urls_index", templateVars);
});


// Deletes the specified url

app.post("/urls/:id/delete", isLoggedIn, (req, res) => {

 if(req.session.user_id === urlDatabase[req.params.id].userID){
   delete urlDatabase[req.params.id]
   res.redirect("/urls");
 } else {
   res.status(403).send("Incorrect user!");
 }

});


// Edits the specified url

app.post("/urls/:id/edit", isLoggedIn, (req, res) => {
  let urlObj = {
    longURL : req.body.newurl,
    userID: req.session.user_id
  }

  if(req.session.user_id === urlDatabase[req.params.id].userID){
    urlDatabase[req.params.id] = urlObj;
    res.redirect("/urls");}
    else {
    res.status(403).send("Incorrect user!");
  }

});


app.post("/urls", (req, res) => {
 const shortURL = generateRandomString();
 const longURL = req.body.longURL;
 let urlObj = {
   longURL: longURL,
   userID: req.session.user_id
 }
 if (longURL) {
   urlDatabase[shortURL] = urlObj;
   res.redirect("/urls");
 } else {
   res.status(403).send("No link entered")
 }
});


// Login Parameters

app.get("/login", (req, res) => {
  res.render('login')
});


// Bcrypt encrypts password to add extra security

app.post("/login", (req, res) => {
  let foundUser = Object.values(users).find(user => user.email === req.body.email);
  if(!foundUser){
    res.status(400).send("User does not exist");
  } else {
    var hashedPassword = foundUser.password;
    if (bcrypt.compareSync(req.body.password,hashedPassword)){
      req.session.user_id = foundUser['id'];
      res.redirect("/urls");
    } else {
      res.status(400).send("Incorrect password!");
    }
  }
});


// Registration page

app.get("/register", (req, res) => {
  res.render('register');
});

app.post("/register", (req, res) => {
  let userID = generateRandomString();
  let{email, password} = req.body;
  if(!req.body.email || !req.body.password) {
    res.status(400).send("Email or password fields cannot be blank!");
  } else {
    let foundEmail = Object.values(users).find(user => user.email === email); // Thanks to mentor for explaining this syntax
    if(!foundEmail){
      const hashedPassword = bcrypt.hashSync(password, 10);
      users[userID] = {id: userID, email: email, password: hashedPassword};
      req.session.user_id = userID;
      res.redirect("/urls");
    } else {
    res.status(400).send("User already registered! Please press back button.");
    }
  }
});


// Logout Parameters

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});
