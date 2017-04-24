
module.exports.ensureAuthenticated = function(req, res, next){

  console.log('@@@@@@@@@@@@@@ > ensureAuthenticated >REQ.session ++: ', req.session)
  console.log('@@@@@@@@@@@@@@ > ensureAuthenticated >REQ.sessionID ++: ', req.sessionID)
  console.log('@@@@@@@@@@@@@@ > ensureAuthenticated >REQ.user ++: ', req.user)

  if (req.isAuthenticated()) {
    console.log('####### > ensureAuthenticated > YES +++++')
    return next();
  } else {
    console.log('####### > ensureAuthenticated > NO +++++')
    res.redirect('/loginorsignup');
  }
};


module.exports.ensureNotAuthenticated = function(req, res, next){
  if (!req.isAuthenticated()) {
    console.log('####### > ensureNotAuthenticated > YES +++++')
    return next();
  } else {
    console.log('####### > ensureNotAuthenticated > NO +++++')
    res.redirect('/');
  }
};


module.exports.noCache = function(req, res, next){
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    //res.header('Expires', '-1');
    //res.header('Pragma', 'no-cache');
    return next();
};