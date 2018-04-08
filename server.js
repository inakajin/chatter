'use strict';

//Dependencies
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var flash = require('connect-flash');

//Application components
var routes = require('./server/routes');
var session = require('./server/session');
var passport = require('./server/auth');
var ioServer = require('./server/socket')(app);
var logger = require('./server/logger')

//Set the port number
var port = process.env.PORT || 3000;

//View Engine
app.set('views', path.join(__dirname, 'server/views'));
app.set('view engine', 'ejs');

//Middleware used in app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.static('public'));
app.use(session);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use('/', routes);

//404 Error Catching
app.use(function(req, res, next) {
    res.status(404).sendFile(process.cwd() + '/server/views/404.htm');
});

ioServer.listen(port);