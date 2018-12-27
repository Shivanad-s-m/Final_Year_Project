const express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

//App Object
const app = express();

//view Engine Middleware using ejs

app.set('view engine', 'ejs');
//specify folder to use view
app.set('views', path.join(__dirname, 'views'));

app.get('/', function(req, res) {
    res.render('index');
});


/*
//Bosy Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//middleware to add static resources like css,html files
app.use(express.static(path.join(__dirname, 'public')));

//Get Request
app.get('/', function(req, res) {
    res.send('Home Page01!!!');
});
*/

//To run on any Dynamic port at runtime
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));