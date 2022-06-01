const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const { engine } = require('express-handlebars');
require('dotenv').config();

const cors = require("cors");
const path = require("path");
const sessions = require('express-session');

const app = express();
const port = 3000;

const cookieParser = require("cookie-parser");

const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));

app.use(cookieParser());

app.use(express.urlencoded({extended: true}));

app.use(express.json());

app.use(express.static('public'));

//app.engine('handlebars', engine({ extname: '.hbs', defaultLayout: './layouts/main.hbs'}));
const handlebars = exphbs.create({ extname: '.hbs',});
app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs');

const routes = require('./server/routes/user');
app.use('/', routes);

app.use(
    cors({
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true,
    })
  );

app.listen(port, () => console.log(`Listening on port ${port}`));