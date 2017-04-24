
module.exports = function (req, res, statusCode) {

  var title;
  var content;
  var addInfo = 'If this problem continues, please contact our Help Desk at 555-555-1234 or email customer.care@ThisGreatApp.com.';

  if (statusCode === 404) {

    title = '404, Page not found:';
    content = 'The page you requested cannot be found. Please try again. \n\n '+addInfo;

  } else if (statusCode === 500) {

    title = '500, Internal server error:';
    content = 'There is a problem with our server. Please try again. \n\n '+addInfo;

  } else {

    title = statusCode + ', Error processing request:';
    content = 'An Error has occurred processing your request. Please try again. \n\n '+addInfo;

  }

  res.status(statusCode);

  res.render('notifyError', {
    title: title,
    message : content,
    type : 'danger'
  });

};