
var cookieParser      = require('cookie-parser');
var csrf              = require('csurf');
var bodyParser        = require('body-parser');
var express 			    = require('express');
var router 				    = express.Router();
var serverControllers = require('../controller/serverMainCtrls');
var authC              = require('../../shared/auth');
var csrfProtection 		= csrf({ cookie: true });
var jwt = require('express-jwt');
var auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: 'payload'
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


router.get('/userhome', auth, serverControllers.getUserHome);

router.get('/membersonly', auth, serverControllers.getMembersOnly);

router.get('/comments', auth, csrfProtection, serverControllers.getComments);

router.post('/comments/maincomment', auth, csrfProtection, serverControllers.postMainComment);

router.post('/comments/subcomment/:subcommentid', auth, csrfProtection, serverControllers.postSubComment);

router.get('/userprofile', auth, csrfProtection, authC.noCache, serverControllers.getUserProfile);

router.get('/logout', auth, serverControllers.getLogout);

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

module.exports = router;