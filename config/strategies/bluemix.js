'use strict';

var passport = require('passport'), 
    BlueMixOAuth2Strategy = require('passport-bluemix').BlueMixOAuth2Strategy;
var db = require('./../db')();
var _ = require('lodash');
var config = require('./../config');



module.exports = function() {
    passport.use('bluemix', new BlueMixOAuth2Strategy({
        authorizationURL : config.bluemix.authorizationURL,
        tokenURL : config.bluemix.tokenURL,
        clientID : config.bluemix.clientID,
        scope: 'profile',
        grant_type: 'authorization_code',
        clientSecret : config.bluemix.clientSecret,
        callbackURL : config.bluemix.callbackURL,
        profileURL: config.bluemix.profileURL
    }, function(accessToken, refreshToken, profile, done) {

        console.log('prof1', profile);

        //check for user
        db.view('cms', 'by_uniqueUserId', {key: profile.userUniqueID, include_docs: true, limit: 1}, function(err, users){
            if (err) {
                return done(err);
            }
            
            //map docs
            var docs = _.map(users.rows, function(row){
                return row.doc;
            });
            
            if (docs.length > 0){
                //set rev if user exists
                profile = _.extend(docs[0], profile);
            }
            else
            {
                //if not set limited access and set the model 
                profile.model = 'User';
                profile.roles = ['none'];
            }

            delete profile._raw;
            delete profile._json;

            profile.username = profile.userDisplayName;
            profile.email = _.first(profile.email);
            
            db.insert(profile, profile._id, function(err, created){
                if (err)
                    return done(err);

                return done(null, created);
            });

           
        });

    }));

};