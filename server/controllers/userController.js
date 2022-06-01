var session = require('express-session');
const mysql = require('mysql');

let connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

exports.index = (req, res) => {
  if(req.session.user.nick == "admin@admin")
res.render('admin')
}

exports.view = (req, res) => {
  connection.query('SELECT * FROM users', (err, rows) => {
    // When done with the connection, release it
    if (!err) {
      res.render('listUsers', { rows });
    } else {
      console.log(err);
    }
    console.log('The data from user table: \n', rows);
  });
}

exports.find = (req, res) => {
  let searchTerm = req.body.search;
  connection.query('SELECT * FROM users WHERE email LIKE ? OR id LIKE ?', ['%' + searchTerm + '%', '%' + searchTerm + '%'], (err, rows) => {
    if (!err) {
      res.render('admin', { rows });
    } else {
      console.log(err);
    }
    console.log('The data from user table: \n', rows);
  });
}

exports.form = (req, res) => {
  res.render('add-user');
}

exports.create = (req, res) => {
  const { first_name, last_name, email, phone, comments } = req.body;
  let searchTerm = req.body.search;
  connection.query('INSERT INTO users SET email = ?, password = ?', [email, password], (err, rows) => {
    if (!err) {
      res.render('add-user', { alert: 'User added successfully.' });
    } else {
      console.log(err);
    }
    console.log('The data from user table: \n', rows);
  });
}

exports.edit = (req, res) => {
  if(req.session.user.userID==req.params.id || req.session.user.userID==0)
  {
  connection.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, rows) => {
    if (!err) {
      res.render('edit-user', { rows });
    } else {
      console.log(err);
    }
    console.log('The data from user table: \n', rows);
  });
}else{
  res.redirect("/home")
}

}

exports.update = (req, res) => {
  const { firstname,surname, email, phone  } = req.body;
  connection.query('UPDATE users SET firstname = ?, surname = ?, phone = ? WHERE id = ?', [firstname, surname, phone, req.params.id], (err, rows) => {
    if (!err) {
      connection.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, rows) => {
        if (!err) {
          res.render('edit-user', { rows, alert: `${firstname} has been updated.` });
        } else {
          console.log(err);
        }
        console.log('The data from user table: \n', rows);
      });
    } else {
      console.log(err);
    }
    console.log('The data from user table: \n', rows);
  });
}

exports.delete = (req, res) => {
  connection.query('UPDATE users SET status = ? WHERE id = ?', ['removed', req.params.id], (err, rows) => {
    if (!err) {
      let removedUser = encodeURIComponent('User successeflly removed.');
      res.redirect('/admin');
    } else {
      console.log(err);
    }
    console.log('The data from beer table are: \n', rows);
  });
} 

exports.viewall = (req, res) => {
  connection.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, rows) => {
    if (!err) {
      res.render('view-user', { rows });
    } else {
      console.log(err);
    }
    console.log('The data from user table: \n', rows);
  });
}
