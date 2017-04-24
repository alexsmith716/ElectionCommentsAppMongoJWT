
var passport = require('passport');
var User = require('../model/userSchema.js');
var serverSideValidation = require('../../shared/serverSideValidation.js')
var stateNamer = require('../../shared/stateNamer.js')

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.ajaxSignUpUser = function(req, res, next){

  var template = {displayname: 'required', 
                        email: 'required',
                        confirmEmail: 'required', 
                        password: 'required', 
                        confirmPassword: 'required',
                        firstname: 'required', 
                        lastname: 'required', 
                        city: 'required', 
                        state: 'required',
                        expectedResponse: 'false'};

  var testerJOB = {displayname: ' displaynameABC123',
                    email: 'aaa1@aaa.com',
                    confirmEmail: '        aaa@aaa.com     ',
                    password: 'pppp',
                    confirmPassword: 'pppp ',
                    firstname: '          Abcdefghijklmnopqrst             ',
                    lastname: '   Ccccc Cityyyyyyyy     ',
                    city: '               AbcdefghijklmnopqrstUvwxyzabcdefghIjklmnopqrstuvwxyz          ',
                    state: 'New York'};

  var testerJOB2 = {displayname: ' displaynameABC123',
                    email: 'aaa1@aaa.com',
                    confirmEmail: '        aaa@aaa.com     ',
                    password: 'pppp',
                    confirmPassword: 'pppp '};

  //req.body = testerJOB2;

  serverSideValidation(req, res, template, function(validatedResponse) {

    var validationErrors = false;

    if(validatedResponse.status === 'err') {

      return next(validatedResponse.message);

    }else{

      for(var prop in validatedResponse) {

        if(validatedResponse[prop].error !== false && validatedResponse[prop].error !== 'match'){

          validationErrors = true;
          break;

        }
      }

    }

    if(!validationErrors){

      var newUser = new User();

      var stateFull = stateNamer(req, res, req.body.state);

      req.body.state = {
        full: stateFull,
        initials: req.body.state
      };

      newUser.displayname = req.body.displayname;
      newUser.email = req.body.email;
      newUser.firstname = req.body.firstname;
      newUser.lastname = req.body.lastname;
      newUser.city = req.body.city;
      newUser.state = req.body.state;

      newUser.setPassword(req.body.password, function(err, result){

        if (err) {

          return next(err);

        }else{

          newUser.save(function(err) {
            var token;

            if (err) {

              return next(err);

            } else {

              token = user.generateJwt();
              sendJSONresponse(res, 201, { 'response': 'success', 'redirect': 'https://localhost:3000/payload?'+token });

              /*
              passport.authenticate('local', function(err, user, info){

                if (err) {

                  return next(err);

                }

                if (!user) {
        
                  sendJSONresponse(res, 201, { 'response': 'error' });
                  return;
        
                }

                req.logIn(user, function(err) {

                  if (err) { 

                    return next(err);

                  }

                  req.session.save(function (err) {

                    if (err) {

                      return next(err);

                    }

                    sendJSONresponse(res, 201, { 'response': 'success', 'redirect': 'https://localhost:3000/userhome' });

                  });

                });

              })(req, res, next);
              */


            }

          });

        }
      });

    }else{

      sendJSONresponse(res, 201, { 'response': 'error', 'validatedData': validatedResponse });

    }

  });
};

module.exports.ajaxLoginUser = function(req, res, next){

  //res.app.locals.foober = true;

  var template = {email: 'required',
                  password: 'required', 
                  expectedResponse: 'true'};

  var testerJOB = {email: 'aaa1@aa a.com',
                    password: '  pppp   '};

  // req.body = testerJOB;

  serverSideValidation(req, res, template, function(validatedResponse) {

    console.log('####### > authentication > ajaxLoginUser > serverSideValidation: ', validatedResponse);

    var validationErrors = false;

    if(validatedResponse.status === 'err') {

      return next(validatedResponse.message);

    }else{

      for(var prop in validatedResponse) {

        if(validatedResponse[prop].error !== false && validatedResponse[prop].error !== 'match'){

          validationErrors = true;
          break;

        }
      }
    }

    console.log('####### > authentication > ajaxLoginUser > validationErrors: ', validationErrors);
    if(!validationErrors){

      console.log('####### > authentication > ajaxLoginUser > passport.authenticate !!!');
      passport.authenticate('local', function(err, user, info){
        var token;

        if (err) {

          return next(err);

        }

        if (!user) {

          sendJSONresponse(res, 201, { 'response': 'error' });
          return;

        }

        token = user.generateJwt();
        console.log('####### > authentication > ajaxLoginUser > token: ', token);
        sendJSONresponse(res, 201, { 'response': 'success', 'token': token, 'redirect': 'https://localhost:3000/userhome' });

        /*
        req.logIn(user, function(err) {
          
          if (err) { 

            return next(err);

          }else{

            user.previouslogin = user.lastlogin;
            user.lastlogin = new Date();

            user.save(function(err, success) {

              if (err) {

                return next(err);

              } else {

                sendJSONresponse(res, 201, { 'response': 'success', 'redirect': 'https://localhost:3000/userhome' });

              }

            });

          }
        });
        */
      })(req, res, next);

    }else{
      
      sendJSONresponse(res, 201, { 'response': 'error', 'validatedData': validatedResponse });

    }
  });
};
