'use strict';
var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Room = require('../models/room');

//Home page
router.get('/', function(req, res, next) {
    //redirect to rooms is user is logged in
    if(req.isAuthenticated()){
        res.redirect('/rooms');
    }
    else{
        res.render('login', {
            success: req.flash('success')[0],
            errors: req.flash('error'),
            showRegisterForm: req.flash('showRegisterForm')[0]
        });
    }
});

//Login
router.post('/login', passport.authenticate('local', {
    successRedirect: '/rooms',
    failureRedirect: '/',
    failureFlash: true
}));

//Register UN/PW
router.post('/register', function(req, res, next) {
    var credentials = {'username': req.body.username, 'password': req.body.password };
    if(credentials.username === '' || credentials.password === ''){
        req.flash('error', 'Missing credentials');
        req.flash('showRegisterForm', true);
        res.redirect('/');
    }else{
        //check is username already exists
       User.findOne({'username': new RegExp('^' + req.body.username + '$', 'i'), 'socialId': null}, function(err, user){
        if(err) throw err;
        if(user){
            req.flash('error', 'Username already exists.');
            req.flash('showRegisterForm', true);
            res.redirect('/');
        }else{
            User.create(credentials, function (err, newUser){
                if(err) throw err;
                req.flash('success', 'Your account has been created. Please log in')
                res.redirect('/');
            });
        }
    });
    }
});

//Social Auth Routes
//Facebook
router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/rooms',
    failureRedirect: '/',
    failureFlash: true
}));
//Twitter
router.get('/auth/twitter', passport.authenticate('twitter'));
router.get('/auth/twitter/callback', passport.authenticate('twitter', {
    successRedirect: '/rooms',
    failureRedirect: '/',
    failureFlash: true
}));

//Rooms
router.get('/rooms', [User.isAuthenticated, function(req, res, next) {
    Room.find(function(err, rooms){
        if(err) throw err;
        res.render('rooms', { rooms });
    });
}]);

//Chats
router.get('/chat/:id', [User.isAuthenticated, function(req, res, next) {
    var roomId = req.params.id;
    Room.findById(roomId, function(err, room){
        if(err) throw err;
        if(!room){
            return next();
        }
        res.render('chatroom', { user: req.user, room: req.room });
    });
}]);

//Logout
router.get('/logout', function(req, res, next) {
    req.logout();
    req.session = null;
    res.redirect('/');
});
module.exports = router;