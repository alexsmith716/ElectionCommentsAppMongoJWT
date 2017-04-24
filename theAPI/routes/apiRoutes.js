
var express = require('express')
var router = express.Router()
var apiControllers = require('../controller/apiMainCtrls')
var apiAuthControllers = require('../controller/authentication');
// var auth = require('../../shared/auth')
var cookieParser = require('cookie-parser')
var csrf = require('csurf')
var csrfProtection = csrf({ cookie: true })
var passportAuthenticate = require('../../shared/passportAuthenticate')
var jwt = require('express-jwt');
var auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: 'payload'
});



router.get('/index', apiControllers.getIndexResponse)

/*
router.get('/comments', apiControllers.getCommentsResponse)
router.post('/comments/maincomment', auth.ensureAuthenticated, apiControllers.postMainCommentResponse)
router.post('/comments/subcomment/:subcommentid', auth.ensureAuthenticated, apiControllers.postSubCommentResponse)
router.get('/:commentid', auth.ensureAuthenticated, apiControllers.getOneCommentResponse)
*/

// router.get('/userprofile/:userid', passportAuthenticate(req, res, false, apiControllers.getUserProfileResponse))

// router.get('/userprofile/:userid', auth.ensureAuthenticated, apiControllers.getUserProfileResponse)

// router.get('/userprofile/:userid', apiControllers.getUserProfileResponse)

router.post('/signupuser', csrfProtection, apiAuthControllers.ajaxSignUpUser)

router.post('/loginuser', csrfProtection, apiAuthControllers.ajaxLoginUser)

/*
router.post('/forgotpassword', csrfProtection, apiControllers.ajaxForgotPassword)

router.put('/evaluateuserprofile', auth.ensureAuthenticated, csrfProtection, apiControllers.ajaxEvaluateUserProfile)

router.put('/userprofileemailpass', auth.ensureAuthenticated, csrfProtection, apiControllers.ajaxUserProfileEmailPass)

router.post('/evaluateuseremail', csrfProtection, apiControllers.ajaxEvaluateUserEmail)
*/

module.exports = router
