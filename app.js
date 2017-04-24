
require('dotenv').load()

process.env.NODE_ENV = 'development'

var express = require('express')
var helmet = require('helmet')
var https = require('https')
var path = require('path')
// var favicon = require('serve-favicon')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var fs = require('fs')
var morgan = require('morgan')
var rfs = require('rotating-file-stream')
var passport = require('passport')
var session = require('express-session')
var MongoStore = require('connect-mongo')(session)
var serverRoutes = require('./theServer/routes/serverRoutes')
var apiRoutes = require('./theAPI/routes/apiRoutes')
var createError = require('http-errors')

var sanitize = require('./shared/sanitizeInput.js')

require('./theAPI/model/dbConnector')
var setUpAuthentication = require('./theAPI/model/passport')
require('./shared/sessionPrototype')

var app = express()

app.use(helmet())
// app.use(helmet.noCache())

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

var logDirectory = path.join(__dirname, 'httpRequestLog')

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

var options = {
  key: fs.readFileSync(path.join(__dirname, './ssl/thisgreatappPEM.pem')),
  cert: fs.readFileSync(path.join(__dirname, './ssl/thisgreatappCRT.crt'))
}


setUpAuthentication();
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

app.set('views', path.join(__dirname, 'theServer', 'views'))
app.set('view engine', 'pug')

// app.use(favicon(__dirname + '/public/images/favicon.ico'))
app.use(express.static(path.join(__dirname, 'public')))

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

var accessLogStream = rfs('access.log', {
  interval: '1d',
  path: logDirectory
})

app.use(morgan('dev'))
// app.use(morgan('combined', {stream: accessLogStream}))

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

// var cookieExpireDate = new Date( Date.now() + 14 * 24 * 60 * 60 )
var sessionExpireDate = 6 * 60 * 60 * 1000
// 6 hours
// var sessionExpireDate = 1 * 60 * 1000
// 1 minute
// var sessionExpireDate = 10 * 60 * 1000
// 10 minutes

app.use(session({
  store: new MongoStore({
    url: 'mongodb://localhost/pec2016s',
    autoRemove: 'native'
  }),
  name: 'id',
  secret: process.env.SESSION_SECRET,
  resave: false,
  rolling: true,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: sessionExpireDate
  }
}))

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

app.use(passport.initialize())
app.use(passport.session())

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

app.use(function (req, res, next) {
  console.log('++++++++++++++++++++++++++++ APP.js +++++++++++++++++++++++++++++++++')
  // console.log('REQ.baseUrl ++: ', req.baseUrl)
  // console.log('REQ.cookies ++: ', req.cookies)
  // console.log('REQ.signedCookies ++: ', req.signedCookies)
  // console.log('REQ.secure ++: ', req.secure)
  // console.log('REQ.fresh ++: ', req.fresh)
  // console.log('REQ.stale ++: ', req.stale)
  // console.log('REQ.protocol ++: ', req.protocol)
  // console.log('REQ.path ++: ', req.path)
  // console.log('REQ.route ++: ', req.route)
  // console.log('REQ.method ++: ', req.method)
  // console.log('REQ.url ++: ', req.url)
  // console.log('REQ.originalUrl ++: ', req.originalUrl)
  // console.log('REQ.headers.referer ++: ', req.headers['referer'])
  // console.log('REQ.headers.user-agent ++: ', req.headers['user-agent'])
  //console.log('REQ.headers ++: ', req.headers)
  console.log('REQ.query ++: ', req.query)
  console.log('REQ.query.token ++: ', req.query.token)
  // console.log('REQ.session ++: ', req.session)
  // console.log('REQ.sessionID ++: ', req.sessionID)
  // console.log('REQ.user ++: ', req.user)
  req.user ? console.log('REQ.user._id: ', req.user._id) : null
  // console.log('REQ.query ++: ', req.query)
  // console.log('REQ.body ++: ', req.body)
  // console.log('REQ.params ++: ', req.params)
  console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')

  var reqBody = sanitize(req.body)
  var reqQuery = sanitize(req.query)
  var reqParams = sanitize(req.params)

  if (reqBody['badInput'] || reqQuery['badInput'] || reqParams['badInput']) {
    var err = new Error('Bad Request')
    err.status = 400
    return next(err)
  } else {
    next()
  }
})

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

app.use(function (req, res, next) {
  res.locals.currentUser = req.user
  res.locals.reqUrl = req.url
  res.locals.currentURL = req.url

  // if(res.locals.currentUser){
    // req.session.paginateFrom = res.locals.sortDocsFrom;
    // req.session.lastPageVisited = '/indexView';
  // }

  var s = /Safari/
  var c = /Chrome/

  if ((s.test(req.headers['user-agent'])) && (!c.test(req.headers['user-agent']))) {
    app.locals.isSafari = true
  } else {
    app.locals.isSafari = false
  }
  
  next()
})

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

if (app.get('env') === 'development') {
  app.locals.pretty = true
}

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

app.use(function (req, res, next) {
  // return next(createError(401, 'Please login to view this page.'))
  next()
})

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

app.use('/', serverRoutes)
app.use('/api', apiRoutes)

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    console.log('######### DEVELOPMENT ###########')

    res.status(err.status || 500)

    // res.locals.message = err.message
    app.locals.notifyErrorMessageObject = err
    app.locals.notifyErrorMessageReqXhr = req.xhr
    app.locals.notifyErrorMessageReferer = req.headers['referer']
    res.locals.resLocalsBasicView = 'ResLocalsBasicView!!'

    // console.log('DEV ERROR code: ', err.code)
    // console.log('DEV ERROR status: ', err.status)
    // console.log('DEV ERROR name: ', err.name)
    // console.log('DEV ERROR message: ', err.message)
    // console.log('DEV ERROR xhr: ', req.xhr)
    // console.log('DEV ERR: ', err)

    req.logout()

    req.session.destroy(function () {
      if (req.xhr) {
        res.json({'response': 'error', 'type': 'error', 'redirect': 'https://localhost:3000/notifyerror'})
      } else {
        console.log('######### DEVELOPMENT ########### REDIRECT ++++')
        res.redirect('/notifyerror')
      }
    })
  })
}

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports = app

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

app.set('port', process.env.PORT || 3000)
var server = https.createServer(options, app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + server.address().port)
})
