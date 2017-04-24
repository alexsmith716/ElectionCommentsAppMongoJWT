
var cookieParser      = require('cookie-parser');
var csrf              = require('csurf');
var bodyParser        = require('body-parser');
var express 			    = require('express');
var router 				    = express.Router();
var serverControllers = require('../controller/serverMainCtrls');
var authC              = require('../../shared/auth');
var csrfProtection 		= csrf({ cookie: true });
var jwt = require('express-jwt');

router.use(function(req, res, next) {
  console.log('+++++++++++++ SERVER ROUTES ++++++++++++')
  next();
});


// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.get('/', serverControllers.getIndex);
router.get('/loginorsignup', serverControllers.getLoginOrSignup);
router.get('/dummypage', serverControllers.getDummyPage);
router.get('/resources', serverControllers.getResouces);
router.get('/about', serverControllers.getAbout);
router.get('/contact', serverControllers.getContact);
router.get('/team', serverControllers.getTeam);
router.get('/customerservice', serverControllers.getCustomerService);

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.get('/signup', csrfProtection, serverControllers.getSignup);
router.get('/login', csrfProtection, serverControllers.getLogin);

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.get('/rendernotifyerror', serverControllers.renderNotifyError);
router.get('/notifyerror', serverControllers.getNotifyError);

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


//router.get('/userhome', serverControllers.getUserHome);

router.get('/membersonly', serverControllers.getMembersOnly);

router.get('/comments', csrfProtection, serverControllers.getComments);

router.post('/comments/maincomment', csrfProtection, serverControllers.postMainComment);

router.post('/comments/subcomment/:subcommentid', csrfProtection, serverControllers.postSubComment);

router.get('/userprofile', csrfProtection, authC.noCache, serverControllers.getUserProfile);

router.get('/logout', serverControllers.getLogout);

router.use(jwt({
  secret: process.env.JWT_SECRET,
  credentialsRequired: false,
  getToken: function fromHeaderOrQuerystring (req) {
    if (req.query && req.query.token) {
      return req.query.token
    }
    return null
  }
}),function(req, res, next){
	console.log('++++++++ SERVER ROUTES > getToken > req.user: ', req.user)
	console.log('++++++++ SERVER ROUTES > getToken > req.method: ', req.method)
	console.log('++++++++ SERVER ROUTES > getToken > req.url: ', req.url)
  res.locals.currentUser = req.user
	next()
})


router.get('/userhome', serverControllers.getUserHome)

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

module.exports = router;
