
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

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "u@u.com",
    password: "u"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "z@z.com",
    password: "z"
},
}


// Change below into objects that have a key long URL where the value
// would be where the string is now. Then change URL database to correct structure. 

var urlDatabase = {
  // XXX
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
  if (!req.cookies["user_id"]) {
    res.locals.user_id = req.cookies["user_id"];
    return res.redirect('/login');
  }
  else {
    return next();
  }
  return next();
}

app.get("/u/:shortURL", (req, res, next) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/urls/new", isLoggedIn, (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], user: req.cookies["user_id"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], user: req.cookies["user_id"]};
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], user: req.cookies["user_id"]};
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  //res.cookie("user_id", req.body.user_id);
  let templateVars = { urls: urlDatabase, userID: req.cookies["user_id"]};
  console.log(templateVars.userID);
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let{longURL} = req.body;
  urlDatabase[shortURL] = longURL
  res.redirect("/urls");
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
 const shortURL = generateRandomString();
 const longURL = req.body.longURL;
 let urlObj = {
   longURL: longURL,
   userID: req.cookies["user_id"]
 }
 if (longURL) {
   urlDatabase[shortURL] = urlObj.longURL;
   res.redirect("/urls");
 } else {
   res.status(403).send("No Link entered")
 }
});




// Login Parameters

app.get("/login", (req, res) => {
  res.render('login')
});

app.post("/login", (req, res) => {
  let foundUser = Object.values(users).find(user => user.email === req.body.email);
  if(!foundUser){
    res.status(400).send("User does not exist");
  }
  else{
    if (foundUser.password === req.body.password){
      res.cookie('user_id', foundUser['id']);
      res.redirect("/urls");
    }
    else{
      res.status(400).send("Incorrect password!");
    }
  }


});

app.get("/register", (req, res) => {
  let templateVars = {user: users,
                      email: req.cookies["email"],
                      password: req.cookies["password"]}
  res.render('register', templateVars);
});

app.post("/register", (req, res) => {
let userID = generateRandomString();
let{email, password} = req.body;
if(!req.body.email || !req.body.password) {
  res.status(400).send("Bad request");
}

else{
  let foundEmail = Object.values(users).find(user => user.email === email);
  if(!foundEmail){
    users[userID] = {id: userID, email: email, password: password};
    res.cookie('user_id', userID)
    console.log("it didnt find an email", userID)
    res.redirect("/urls");
  }
  else {
    res.status(400).send("User already registered! Please press back button.");
  }}
});


// Logout Parameters

app.post("/logout", (req, res) => {
res.clearCookie("user_id");
res.redirect("/urls");
});
