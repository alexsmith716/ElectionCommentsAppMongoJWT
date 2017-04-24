
var passport = require('passport');

module.exports = function(req, res, isXhr, whereNext, next) {

  console.log('####### > passportAuthenticate > isXhr/whereNext: ', isXhr);

  passport.authenticate('local', function (err, user, info) {

    if (err) {

      console.log('####### > passportAuthenticate > err ++++++++');
      return next(err)

    }

    if (!user) {

      console.log('####### > passportAuthenticate > !user ++++++++');

      if (isXhr) {

        sendJSONresponse(res, 201, { 'response': 'error' })

      } else {

        res.redirect('/notifyerror')

      }
      return;
    }

    req.logIn(user, function(err) {
      if (err) { 
        return next(err)
      }

      console.log('####### > passportAuthenticate > req.logIn ++++++++');
      req.session.save(function (err) {
        if (err) {
          return next(err)
        }

        if (isXhr) {
          console.log('####### > passportAuthenticate > req.logIn 1++++++++');
          sendJSONresponse(res, 201, { 'response': 'success', 'redirect': whereNext })
        } else {
          console.log('####### > passportAuthenticate > req.logIn 2++++++++');
          whereNext
        }
      })

    })
    
  })(req, res, next)
}
