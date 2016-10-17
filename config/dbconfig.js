'use strict';

module.exports = function(config){

  var crypto = require('crypto');
  var _ = require('lodash');
  var nano = require('nano')(config.couch);
  var publishednano = require('nano')(config.publishedcouch);
  var os = require('os');

  //create db if it doesnt exist
  publishednano.db.create(config.sitedb, function(err, body) {
    if (err) 
      console.log('site db exists');
    else
        console.log('created site db');

    var db = nano.use(config.sitedb);

    db.get('_design/site', function(err, existing){

      var design = {
        views: {
          by_url: {
            map: 'function (doc) { if (doc.model && doc.model === "Page" && doc.url && doc.locale) return emit([doc.url, doc.locale], null); }'
          },
          by_model: {
            map: 'function (doc) { if (doc.model) return emit(doc.model, null); }'
          },
          by_masterId: {
            map: 'function (doc) { if (doc.model && doc.model === "Page" && doc.masterId && doc.locale) return emit([doc.masterId, doc.locale], null); }'
          },
          by_allForMasterId: {
            map: 'function (doc) { if (doc.model && doc.model === "Page" && doc.masterId) return emit(doc.masterId, null); }'
          }
        }
      };

      if (existing){
        design = _.extend(existing, design);
      }

      //create views
      db.insert(design, '_design/site', function(err, doc) {
        if (err){
          console.log('site views exist');
        }

      });
    });
    
  });

  //create db if it doesnt exist
	nano.db.create(config.cmsdb, function(err, body) {
    if (err) {
      console.log('cms db exists');
    }
    else{
      console.log('adding cms db');
    }

    var db = nano.use(config.cmsdb);

    db.get('_design/cms', function(err, existing){

      var design = {
        views: {
          by_model: {
            map: 'function (doc) { if (doc.model) return emit(doc.model, null); }'
          },
          by_template: {
            map: 'function (doc) { if (doc.model && doc.model === "Page" && doc.template) return emit(doc.template, null); }'
          },
          by_username: {
            map: 'function (doc) { if (doc.model && doc.model === "User" && doc.username) return emit(doc.username, null); }'
          },
          by_uniqueUserId: {
            map: 'function (doc) { if (doc.model && doc.model === "User" && doc.userUniqueID) return emit(doc.userUniqueID, null); }'
          },
          settingsForSite: {
            map: 'function (doc) { if (doc.model && doc.model === "Settings" && doc.siteId) return emit(doc.siteId, null); }'
          },
          contentSearch: {
            map: 'function(doc){if (doc.name && doc.model === "Content"){ var name = doc.name.toLowerCase().replace(/[^a-zA-Z0-9]/gi, " "); var split = name.split(" "); for (var i = 0; i < split.length; i++){ if (split[i].trim().length === 0) { continue; } emit([split[i], doc.name], null);}}}'
          },
          pageSearch: {
            map: 'function(doc){if (doc.name && doc.model === "Page"){ var name = doc.name.toLowerCase().replace(/[^a-zA-Z0-9]/gi, " "); var split = name.split(" "); for (var i = 0; i < split.length; i++){ if (split[i].trim().length === 0) { continue; } emit([split[i], doc.name], null);}}}'
          },
          templateSearch: {
            map: 'function(doc){if (doc.name && doc.model === "Template"){ var name = doc.name.toLowerCase().replace(/[^a-zA-Z0-9]/gi, " "); var split = name.split(" "); for (var i = 0; i < split.length; i++){ if (split[i].trim().length === 0) { continue; } emit([split[i], doc.name], null);}}}'
          }
        }
      };

      if (existing){
        design = _.extend(existing, design);
      }

      //create cms views
      db.insert(design, '_design/cms', function(err, doc) {
        if (err){
          console.log('views exist');
        }


        var user = {
          username: 'superadmin',
          password: process.env.ADMIN_PW || 'ogilvyD1g1tal',
          model: 'User',
          roles: ['admin']
        };

        user.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64').toString();
        user.password = crypto.pbkdf2Sync(user.password, user.salt, 10000, 64).toString('base64');

        //create user if it doesnt exist
        db.view('cms', 'by_username', {key: user.username, include_docs: true}, function(err, response){
          if (err)
            console.log('err getting users');

          if (response && response.rows && response.rows.length > 0){
            user = _.extend(response.rows[0].doc, user);
          }

          db.insert(user, user._id, function(err, user){
            if (err)
              console.log('error creating admin');

            console.log('created admin', user);

          });

        });

        var siteId = process.env.SITEID || 1;
        
        db.view('cms', 'settingsForSite', {key: siteId, include_docs: true}, function(err, response){
          if (err)
            console.log('err getting settings');

          var updated = false;
          var settings = {};
          if (!response || !response.rows || response.rows.length === 0){
            settings = {
              countryCode: 'us',
              languages: [{name: 'English', locale: 'en-us'}],
              siteowner: '',
              copyright: '',
              title: '',
              subtitle: '',
              siteId: siteId,
              model: 'Settings'
            };
            updated = true;
            
          }
          else{
            //this is to fix the dictionary in settings to ensure it follows the new format
            
            settings = response.rows[0].doc;
            
            _.each(settings.languages, function(language){
              var locale = language.locale;
              if (settings.dictionary && settings.dictionary[locale] && !_.isArray(settings.dictionary[locale])){
                var dictionary = [];
                _.each(settings.dictionary[locale], function(value, key){
                  var name = '';
                  switch(key) {
                    case 'quotestyle':
                      name = 'Quote Style';
                      break;
                    case 'site_nav_label':
                      name = 'Site Nav Label';
                      break;
                    case 'recommended':
                      name = 'Recommended';
                      break;
                    case 'phone':
                      name = 'Phone';
                      break;
                    case 'phonemobilelabel':
                      name = 'Phone Mobile Label';
                      break;
                    case 'priority':
                      name = 'Priority';
                      break;
                    case 'share':
                      name = 'Share';
                      break;
                    case 'social':
                      name = 'Social';
                      break;
                    case 'crosssitelabel':
                      name = 'Cross Site Label';
                      break;
                    case 'crosssiteurl':
                      name = 'Cross Site Url';
                      break;
                    case 'featured':
                      name = 'Featured';
                      break;
                  }
                  dictionary.push({name: name, key: key, value: value});
                });

                settings.dictionary[locale] = dictionary;
                updated = true;
              }

              if (updated){
                db.insert(settings, function(err, savedSettings){
                  if (err)
                    console.log('error creating settings');

                  console.log('created settings', savedSettings);

                });
              }
            });
          }
        });
      });



    });

    


	});


};