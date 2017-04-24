
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var User = require('./userSchema.js')

module.exports = function() {
  // serialize user into session
  passport.serializeUser(function (user, done) {
    console.log('####### AUTHENTICATION > PASSPORT.serializeUser $$$$$$')
    done(null, user.id)
  })

  // deserialize user out of the session
  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      if (user) {
        console.log('####### AUTHENTICATION > PASSPORT.deserializeUser $$$$$$')
      }
      done(err, user)
    })
  })

  passport.use('local', new LocalStrategy({ usernameField: 'email' }, function (username, password, done) {
      User.findOne({ email: username }, function (err, user) {
        if (err) { 
          return done(err)

        } else if (!user) {
          return done(null, false, { message: 'No user has that username!' })

        } else {
          user.checkPassword(password, function(err, result) {
            if (err) {
              return done(err)
            }

            if (!result) {
              return done(null, false, { message: 'Invalid password.' })

            } else {
              console.log('####### AUTHENTICATION > PASSPORT > USER CHECKPASSWORD GOOD $$$$$$')
              return done(null, user)

            }
          })
        }
      })
    }
  ))
}
