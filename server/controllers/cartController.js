var session = require('express-session');
const mysql = require('mysql');
var nodemailer = require('nodemailer');

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
})

exports.add = (req, res) => {
  if(req.session.user)
  {
    var licznik = 0
    if(req.session.user.cart.length < 3)
    {
   req.session.user.cart.forEach(function(i,n){
    if(req.session.user.cart[n] == req.params.id)
    {
      licznik++
    }
  });
  if(licznik < 1)
  {
    req.session.user.cart.push(req.params.id)
  }
  console.log(req.session.user)
  res.redirect("/home")
    }
  }else{
    res.redirect("/home")
  }
}

exports.view = (req, res) => {
  if(req.session.user && req.session.user.cart!=0)
  {
    var tab = req.session.user.cart
   connection.query('SELECT * FROM films WHERE id IN (?)', [tab], (err, rows) => {
    if (!err) {
      res.render('cart', { rows, userID: req.session.user.userID});
    } else {
      console.log(err);
    }
  });
}else if(req.session.user && req.session.user.cart==0){
  res.render("home", { alert: "Brak rzeczy w koszyku" })
}else{
  res.redirect("/home")
}
}

exports.remove = (req, res) => {
  var id = req.params.id
  if(req.session.user)
  {
    var tab = req.session.user.cart
      tab.forEach(function(i,n){
        if(tab[n] == id)
        {
          tab.splice(n,1)
        }
      });
    req.session.user.cart=tab
    
    if(tab.length==0)
    {
      tab=0
    }

   connection.query('SELECT * FROM films WHERE id IN (?)', [tab], (err, rows) => {
    if (!err) {
      res.render('cart', { rows });
    } else {
      console.log(err);
    }
    //console.log('Nie ma filmów: \n', rows);
  });
}
console.log(req.session.user)
}

exports.buy = (req, res) => {
  if(req.session.user && req.session.user.cart!=0)
  {
      var tab = req.session.user.cart
      var price = 0
      var names =[]
      var czy = "nie"
      connection.query('SELECT * FROM films WHERE id IN (?)', [tab], (err, rows) => {
        for(var i=0; i<rows.length;i++)
        {
          price += rows[i].price 
          names.push(rows[i].name)
      }

      if(names.length>2)
      {
        price=price*0.85
        price = price.toFixed(2)
        czy = "tak"
      }
    connection.query("UPDATE users SET item1 = ?, item2 = ?, item3 = ?, charge = ? WHERE users.id = ?", [tab[0], tab[1], tab[2], price, req.session.user.userID], (err, rows) => {
      if (!err) {
        transporter.sendMail({from:"legitwypozyczalniafilmow@gmail.com", to: req.session.user.nick, subject: "Zakup", text: "Dziękujemy za zaufanie i zakup. Cena: " + price  + "\nZakupy: "+ names + "\nRabat: " + czy}, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
      } else {
        console.log(err);
      }
    });
    req.session.user.cart = []
    res.render("cart", {price})
  });
  }else{
    res.redirect("/home")
  }
}