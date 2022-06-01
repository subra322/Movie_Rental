const mysql = require('mysql');

let connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

exports.index = (req, res) => {
res.render('admin')
}

exports.view = (req, res) => {
  connection.query('SELECT * FROM films ORDER BY films.price ASC', (err, rows) => {
    if (!err) {
      res.render('listFilms', { rows });
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

exports.new = (req, res) => {
  res.render('add-film');
}

exports.add = (req, res) => {
  const { name, category, time, price, img_link } = req.body;
  let searchTerm = req.body.search;
  connection.query('INSERT INTO films SET name = ?, category = ?, time = ?, price = ?, img_link = ?', [name, category, time, price, img_link], (err, rows) => {
    if (!err) {
      res.render('add-film', { alert: 'Film added successfully.' });
    } else {
      console.log(err);
    }
    console.log('The data from user table: \n', rows);
  });
}

exports.edit = (req, res) => {
  connection.query('SELECT * FROM films WHERE id = ?', [req.params.id], (err, rows) => {
    if (!err) {
      res.render('edit-film', { rows });
    } else {
      console.log(err);
    }
    console.log('The data from user table: \n', rows);
  });
}

exports.update = (req, res) => {
  const { name, category, time, price, img_link } = req.body;
  connection.query('UPDATE films SET name = ?, category = ?, time = ?, price = ?, img_link = ? WHERE id = ?', [name, category, time, price, img_link, req.params.id], (err, rows) => {

    if (!err) {
      connection.query('SELECT * FROM films WHERE id = ?', [req.params.id], (err, rows) => {
        
        if (!err) {
          res.render('edit-film', { rows, alert: `${name} has been updated.` });
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
  connection.query('UPDATE films SET status = ? WHERE id = ?', ['removed', req.params.id], (err, rows) => {
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
  connection.query('SELECT * FROM films WHERE id = ?', [req.params.id], (err, rows) => {
    if (!err) {
      res.render('view-film', { rows });
    } else {
      console.log(err);
    }
    console.log('The data from user table: \n', rows);
  });

}
