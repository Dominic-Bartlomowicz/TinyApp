
function generateRandomString() {

var string = "";
var characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

for(var i = 0; i < 6; i++){
string += characters.charAt(Math.floor(Math.random() * characters.length));}

return string;

}

// Constants

var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const http = require("http");
var cookieParser = require('cookie-parser')
app.use(cookieParser())

app.set("view engine", "ejs")

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};


app.listen(PORT, () => {
  (`Example app listening on port ${PORT}!`);
});


app.get("/", (req, res) => {
  res.end("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});


// EJS Scripts

const isLoggedIn = (req, res, next) => {
  // if (req.cookies["username"]) {
  //   res.locals.username = req.cookies["username"];
  //   return res.redirect('/login');
  // }
  // else {
  //   return next();
  // }
  return next();
}

app.get("/u/:shortURL", (req, res, next) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/urls/new", isLoggedIn, (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"] };
  res.render("urls_new", templatevars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  res.cookie("username", req.body.username);
  let templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(generateRandomString());
  console.log(longURL);  // debug statement to see POST parameters
  res.send("URL Shortening Completed"); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  console.log(req.body["newurl"]);
  urlDatabase[req.params.id] = req.body["newurl"];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
let templateVars = {
  username: req.cookie["username"],
};
res.render("urls_index", templateVars);
res.redirect("/urls");
});



// Login Parameters

app.get("/login", (req, res) => {
  res.render('login')
});

app.post("/login", (req, res) => {
  const {username, password} = req.body;
  res.cookie('username', username);
  res.render('login')
});

app.get("/register", (req, res) => {
  res.render('register')
});

app.post("/register", (req, res) => {
  res.render('register')
});


// Logout Parameters

app.post("/logout", (req, res) => {
res.clearCookie("username");
res.redirect("/urls");
});
