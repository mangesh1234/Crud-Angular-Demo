'use strict';
var express = require('express');
var route = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('../models/UserModel');

module.exports = function (app) {
    //user Routes
    var User = require('../controllers/UserController');
    // site Routes
    var site = require('../controllers/siteController');

    var NonAllocatedUser = require('../controllers/nonAllocatedController');

    app.route('/site/getAllSite').get(site.getSite);
    app.route('/site/createSite').post(site.createSite);
    app.route('/site/GetSiteById/:id').get(site.GetSiteById);
    app.route('/site/EditSite/:id').put(site.EditSite);
    app.route('/site/EditSiteById/:id').put(site.EditSiteById);
    app.route('/site/maintain/:id').put(site.maintain);
    app.route('/site/AssignSites').post(site.AssignSites)
    app.route('/site/UpdateAssignSite').put(site.UpdateAssignSite)

    app.route('/user/registerUser').post(User.create_a_user)
     app.route('/user/getAllUser').get(User.list_all_users1);
    app.route('/user/getAllUser/notAllocated').get(User.list_all_users);
    app.route('/user/getAllUser/Allocated').get(User.list_all_users_allocate);
    app.route('/user/getuser').post(User.login);
    app.route('/allocation/data').get(site.getAllocation);
    app.route('/api/address/:pinCode').get(site.getAddressFromPin);
    app.route('/user/dashboard/information/:id').get(site.getUserInformation);
    app.route('/insert/csvData/').post(site.csvData);
    app.route('/insert/csvData/get').get(site.csvData_get);
    app.route('/get/csvData/:id').get(site.getData);
    app.route('/allocate/user').post(User.list_all_users);
    app.route('/get/allocate').get(User.getAllocate);
    app.route('/get/csvData_All/').post(site.csvData_All);
    //   app.route('/siteData').get(site.siterecords);

    // NonalocatedUser Routes
    app.route('/NonAllocatedUser/create').post(NonAllocatedUser.createNonAllocatedUser);
    app.route('/NonAllocatedUser/getAll').get(NonAllocatedUser.NonAllocatedUser_getAll);

    app.route('/user/:id')
        .get(User.read_a_user)
        .put(User.update_a_user)
        .delete(User.delete_a_user);
    app.get('/user/mobileExist/:mobileNumber', User.check_mobile_number_exist);
    app.get('/user/emailExist/:emailId', User.check_email_exist)


    app.get('/login/facebook',
        passport.authenticate('facebook', { scope: ['email'] }
        ));

    app.get('/login/google',
        passport.authenticate('google', { scope: ['profile', 'email'] }, function(){
            console.log('hello');
        }));
    app.get('/login/twitter',
        passport.authenticate('twitter')
    );

}

passport.use(new LocalStrategy(
    function (username, password, done) {
        User.getUserByUsername(username, function (err, user) {
            console.log('user name' + username);
            console.log('find user' + user);
            if (err) throw err;
            if (!user) {
                return done(null, false, { message: 'Unknow user' });
            }
            User.comparePassword(password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    CurrentUser = user;
                    return done(null, user);
                }
                else {
                    return done(null, false, { message: 'Invalid password' });
                }
            });

        });


    }
));

passport.use('facebook', new FacebookStrategy({
    clientID: '1796697257212559',
    clientSecret: '4403e4960862dc0b5536723ca932ab93',
    callbackURL: 'http://localhost:7004/users/login/facebook/callback',
    profileFields: ['id', 'emails', 'gender', 'name']
},

    // facebook will send back the tokens and profile
    function (access_token, refresh_token, profile, done) {
        // asynchronous
        process.nextTick(function () {
            console.log('passport authetication');
            // find the user in the database based on their facebook id
            User.findOne({ 'facebook.id': profile.id }, function (err, user) {
                debugger;
                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    console.log('profile' + profile);
                    // if there is no user found with that facebook id, create them
                    var newUser = new User();
                    // set all of the facebook information in our user model
                    newUser.facebook.id = profile.id; // set the users facebook id                 
                    newUser.facebook.token = access_token; // we will save the token that facebook provides to the user                    
                    newUser.facebook.name = profile.name.givenName + '' + profile.name.familyName;
                    newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first


                    // save our user to the database
                    newUser.save(function (err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }
            });
        });
    }));

passport.use(new GoogleStrategy({

    clientID: '633593828210-e71hdp688uvg324vb3cfj1igef7rddpi.apps.googleusercontent.com',
    clientSecret: 'blqKJJQZWKsX0UIYcYnCYZLd',
    callbackURL: 'http://localhost:7003/login/google',

},
    function (token, refreshToken, profile, done) {
      console.log('token',token);
      console.log('refreshToken',refreshToken);
      console.log('profile',profile);
      console.log('done',done);
      
        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function () {
        console.log('hello');
            // try to find the user based on their google id
            User.findOne({ '_id': profile.id }, function (err, user) {
                if (err)
                    return done(err);

                if (user) {

                    // if a user is found, log them in
                    return done(null, user);
                } else {
                    // if the user isnt in our database, create a new user
                    var newUser = new User();

                    // set all of the relevant information
                    newUser.google.id = profile.id;
                    newUser.google.token = token;
                    newUser.google.name = profile.displayName;
                    newUser.google.email = profile.emails[0].value; // pull the first email

                    // save the user
                    newUser.save(function (err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });

    }));

passport.use(new TwitterStrategy({

    consumerKey: 'ipKXnDh6walVuP0cKen1N98I1',
    consumerSecret: 'B2goHPQwH8TB5wggP6CrxNf2lVjb26nvWpZLhRWaqH7rSUCi0c',
    callbackURL: 'http://localhost:8000/users/login/twitter/callback'

},
    function (token, tokenSecret, profile, done) {

        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Twitter
        process.nextTick(function () {

            User.findOne({ 'twitter.id': profile.id }, function (err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user, create them
                    var newUser = new User();

                    // set all of the user data that we need
                    newUser.twitter.id = profile.id;
                    newUser.twitter.token = token;
                    newUser.twitter.username = profile.username;
                    newUser.twitter.displayName = profile.displayName;

                    // save our user into the database
                    newUser.save(function (err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });

        });

    }));
