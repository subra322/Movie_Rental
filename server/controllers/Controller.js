const mysql = require('mysql');
var nodemailer = require('nodemailer');

// Connection Pool
let connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'legitwypozyczalniafilmow@gmail.com',
    pass: 'zaq1@WSX'
  }
});

const bcrypt = require('bcrypt');
const saltRounds = 10;

var session = require('express-session');

var info = "NULL"
var tab
var loggedUsername = "0" // zmieniamy

exports.index = (req, res) => {
  connection.query('SELECT * FROM films ORDER BY films.price ASC', (err, rows) => {
    tab=rows
    if (!err) {
      if(req.session.user)
      {
        res.render('home', { rows, info: req.session.user.nick, userID: req.session.user.userID });
      }else
      {
        res.render('home', { rows, info: "" });
      }
    
    } else {
      console.log(err);
    }
  });
}

exports.search = (req, res) => {
 const search = req.query.search
 console.log(search)
 if(search==0)
 {
  res.redirect("/home")
}else{
  connection.query('SELECT * FROM films WHERE category = ?', [search], (err, rows) => {
    if (!err) {
      if(req.session.user)
      {
        res.render('home', { rows, info: req.session.user.nick, userID: req.session.user.userID });
      }else
      {
        res.render('home', { rows, info: "", userID: "" });
      }
    } else {
      console.log(err);
    }
  });
}
}

exports.login = (req, res) =>
{
  res.render('login');
}

exports.register = (req, res) =>
{
  res.render('register');
}

exports.auths = (req, res) =>
{
    const username = req.body.username;
    const password = req.body.password;
    const firstname = req.body.firstname;
    const surname = req.body.surname;
    const phone = req.body.phone;

    connection.query('SELECT email FROM users WHERE email LIKE ?', [username], (err, rows) => {
      if (!err) {
        if(rows == 0)
        {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        console.log(err);
      }
      transporter.sendMail({from:"legitwypozyczalniafilmow@gmail.com", to: username, subject: "Witamy w naszej wypozyczalni", text: "Dziękujemy za zaufanie"}, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      connection.query(
        "INSERT INTO users (`id`, `email`, `password`, `elements`, `firstname`, `surname`, `phone`) VALUES (NULL, ?, ?, 0, ?, ?, ?);",
        [username, hash, firstname, surname, phone],
        (err, result) => {
          console.log(err);
        }
      );
    });
    res.redirect("/home")
  }
  else
  {
    res.send({ message: "Istnieje taki" });
  }
} else {
  console.log(err);
}
});
}

exports.log = (req, res) =>
{
  const username = req.body.username;
  const password = req.body.password;
  req.body.username = loggedUsername;
  
  connection.query(
    "SELECT * FROM users WHERE email = ?;",
    username,
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }
      if (result.length > 0) {
      bcrypt.compare(password, result[0].password, (error, response) => {
        req.session.user = {nick: username, cart: [], userID: result[0].id}
        loggedUsername = username
          if (response && username=="admin@admin") {
            res.render('admin', {giveName: 'admin@admin'})
            }else if(response && username!="admin")
            {
              if(req.session.user){
                res.render('home', { rows: tab, info: req.session.user.nick, items: req.session.user.cart, userID: req.session.user.userID, message: "zalogowany" })
            }
          } else {
            res.send({ message: "Złe dane!" });
          }
        });
      } else {
        res.send({ message: "Taki użytkownik nie istnieje" });
      }
    }
  );
}

exports.logout = (req, res) =>
{
  req.session.destroy((err) => {
    res.render('home', { rows: tab, info: ''})
  })
}

