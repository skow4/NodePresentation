// Modules
var range = require('./range');
var express = require("express");
var app = express();
var port = 8000;
var _slide = 1;
var masterPresenterId = null;
var presenters = {};

// Setup the application
app.set('views', __dirname + '/views');
app.set('view engine', "ejs");
app.engine('html', require('ejs').__express);
app.get("/", function(req, res){
    res.render("index.html");
});
app.use(express.static(__dirname + '/public'));