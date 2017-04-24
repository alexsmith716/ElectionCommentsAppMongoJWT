/* global $ */
/* global isSafari */
/* global location */
var helper = {

  init: function () {
    helper.showLoading()

    document.getElementById('state').setAttribute('tabindex', '9')

    setTimeout(function () { helper.hideLoading() }, 500)

    helper.initializeJqueryEvents()
  },

  testFormValidity: function (theForm, eventListener) {
    var boundEventTypes
    var formElement
    var checkConstraints
    var formValid = null
    var resp = {}

    for (var i = 0; i < theForm.length; i++) {
      formElement = $(theForm[i])
      checkConstraints = formElement.get(0).checkValidity()

      if (!checkConstraints && formValid === null) {
        formValid = false
        resp.formValid = false
        resp.focusFirstElement = formElement
      }

      if (eventListener === 'change') {
        boundEventTypes = $._data(formElement[0], 'events')
        for (var eType in boundEventTypes) {
          helper.handleFormEvents(formElement.attr('id'), eType, formElement.val())
        }
      }

      if (eventListener === 'focusout') {
        formElement.on('focusout', function (e) {
          helper.handleFormEvents(formElement.attr('id'), 'focusout', formElement.val())
        })
        formElement.trigger('focusout')
      }
    }
    return resp
  },

  initializeJqueryEvents: function () {
    $('#signUpForm').on('submit', function (e) {
      e.preventDefault()
      helper.showLoading()

      $('#signUpForm .formerror').removeClass('show').addClass('hide')
      var data = helper.postData()
      var constrainedFormElements = document.getElementById('signUpForm').querySelectorAll('[required]')
      var serviceUrl = $(this).attr('action')

      if (isSafari) {
        var testFocusout = helper.testFormValidity(constrainedFormElements, 'focusout')

        if (testFocusout.formValid !== undefined) {
          console.log('+++++++++++ BAD FORM !!!!!!!!!!!')
          testFocusout.focusFirstElement.focus()
          helper.hideLoading()
          return false
        }
      }

      console.log('+++++++++++ GOOD FORM !!!!!!!!!!!')

      data['_csrf'] = $('meta[name="csrf-token"]').attr('content')

      $.ajax({

        rejectUnauthorized: false,
        url: serviceUrl,
        type: 'POST',
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        accepts: 'application/json',

        success: function (data, status, xhr) {
          if (data.response === 'success') {
            $('#signUpForm .form-control').removeClass('has-error')
            $('#signUpForm .form-group .error').removeClass('show').addClass('hide')
            $('#signUpForm .form-group .text-danger').removeClass('show').addClass('hide')
            $('#signUpForm .formerror').removeClass('show').addClass('hide')

            location.href = data.redirect
          } else {
            if (data.validatedData) {
              $('#signUpForm').data('validatedData', data.validatedData)
              helper.handleErrorResponse(data.validatedData)
            } else {
              $('#signUpForm .formerror').removeClass('hide').addClass('show')
            }

            helper.hideLoading()
            return false
          }
        },

        error: function (xhr, status, error) {
          var parsedXHR = JSON.parse(xhr.responseText)

          location.href = parsedXHR.redirect

          return false
        }
      })
    })

    if (isSafari) {
      $('#signUpForm').on('focusin', '#required-fields .form-control', function () {
        var ve = $('#signUpForm').data('validateElement')

        if (ve === undefined) {
          $('#signUpForm').data('validateElement', $(document.activeElement).attr('id'))
        } else {
          helper.handleFormEvents(ve, 'focusout', $('#' + ve).val())
          $('#signUpForm').data('validateElement', $(document.activeElement).attr('id'))
        }
      })
    }

    $('#email').on('change', function (e) {
      helper.handleFormEvents($(this).attr('id'), e.type, $(this).val())
    })

    $('#confirmEmail').on('change', function (e) {
      helper.handleFormEvents($(this).attr('id'), e.type, $(this).val())
    })

    $('#password').on('change', function (e) {
      helper.handleFormEvents($(this).attr('id'), e.type)
    })

    $('#confirmPassword').on('change', function (e) {
      helper.handleFormEvents($(this).attr('id'), e.type)
    })

    $('#state').on('change', function (e) {
      helper.handleFormEvents($(this).attr('id'))
    })
  },

  pattern: {
    displayname: /^[A-Za-z0-9_]{4,21}$/,
    email: /^\S+@\S+\.\S+/,
    password: /^\S{4,}$/,
    password2: /^[\S]{4,}$/,
    basictext: /^(?=\s*\S)(.{1,35})$/
  },

  showLoading: function () {
    $('.modal-backdrop').show()
  },

  hideLoading: function () {
    $('.modal-backdrop').hide()
  },

  handleFormEvents: function (elementID, eType, elementVal) {
    elementID === 'displayname' ? helper.displaynameElementValidation(elementID) : null

    elementID === 'email' ? helper.emailElementValidation(elementID, 'confirmEmail', eType, elementVal) : null
    elementID === 'confirmEmail' ? helper.emailElementValidation(elementID, 'email', eType, elementVal) : null

    elementID === 'password' ? helper.passwordElementValidation(elementID, 'confirmPassword', eType) : null
    elementID === 'confirmPassword' ? helper.passwordElementValidation(elementID, 'password', eType) : null

    elementID === 'firstname' ? helper.textElementValidation(elementID, helper.pattern.basictext) : null
    elementID === 'lastname' ? helper.textElementValidation(elementID, helper.pattern.basictext) : null
    elementID === 'city' ? helper.textElementValidation(elementID, helper.pattern.basictext) : null
    elementID === 'state' ? helper.selectElementValidation(elementID) : null
  },

  displaynameElementValidation: function (elementID) {
    var pattern = helper.pattern.displayname

    $('#' + elementID).on('input', function () {
      helper.testUserInput(elementID, pattern)
    })

    helper.testUserInput(elementID, pattern)
  },

  emailElementValidation: function (elementID, confirmElementID, eType, elementVal) {
    if (eType === 'change') {
      helper.validateEmailField(elementVal, elementID, confirmElementID)
    }

    if (eType === 'focusout') {
      $('#' + elementID).on('input', function () {
        helper.testUserInputEmail(elementID)
      })

      helper.testUserInputEmail(elementID)
    }
  },

  passwordElementValidation: function (elementID, confirmElementID, eType) {
    if (eType === 'change') {
      if (helper.validateParams('password', 'confirmPassword')) {
        isSafari ? $('#' + confirmElementID).off('input') : null
      }
    }

    if (eType === 'focusout') {
      var pattern = helper.pattern.password

      $('#' + elementID).on('input', function () {
        helper.testUserInput(elementID, pattern)
      })

      helper.testUserInput(elementID, pattern)
    }
  },

    // AbcdefghijklmnopqrstUvwxyzabcdefghIjklmnopqrstuvwxyz
  validateMaxLengthUserInput: function (val, maxlen) {
    val = val.trim()
    var newVal = (val.length) - maxlen
    newVal = (val.length) - newVal
    newVal = val.slice(0, newVal)
    return newVal
  },

  textElementValidation: function (elementID, pattern, err1) {
    var thisElementValue = $('#' + elementID).val().trim()
    var title = $('#' + elementID).attr('title')
    err1 !== undefined && err1.error === 'empty' ? thisElementValue = '' : null

    var patternTestValue = pattern.test(thisElementValue)
    err1 !== undefined && err1.lengthError === 'maxlength' ? patternTestValue = false : null

    if (err1 !== undefined) {
            // console.log('textElementValidation > err1: ', elementID, ' || ', thisElementValue, ' || ', patternTestValue, ' || ', err1)
    } else {
            // console.log('textElementValidation > no err1: ', elementID, ' || ', thisElementValue, ' || ', patternTestValue)
    }

    if (thisElementValue !== '') {
      if (!patternTestValue) {
        isSafari ? $('#' + elementID + 'Error').text('Invalid input. ' + $('#' + elementID).attr('title')) : null
        err1 !== undefined && !isSafari ? $('#' + elementID + 'Error').text('Please match the requested format. ' + title) : null

        if ((err1 !== undefined && !isSafari) || isSafari) {
          $('#' + elementID + 'Error').removeClass('hide').addClass('show')
        }

        if (err1 !== undefined && err1.lengthError === 'maxlength') {
          var newVal = helper.validateMaxLengthUserInput($('#' + elementID).val(), err1.stringValLength)
          $('#' + elementID).val(newVal)
        }
      } else {
        isSafari ? $('#' + elementID + 'Error').text('') : null
        isSafari ? $('#' + elementID + 'Error').removeClass('show').addClass('hide') : null
        $('#' + elementID).get(0).setCustomValidity('')
      }
    } else {
      isSafari ? $('#' + elementID + 'Error').text('Please fill out this field. ' + $('#' + elementID).attr('title')) : null
      err1 !== undefined && !isSafari ? $('#' + elementID + 'Error').text('Please fill out this field.') : null

      if ((err1 !== undefined && !isSafari) || isSafari) {
        $('#' + elementID + 'Error').removeClass('hide').addClass('show')
      }
    }
  },

  selectElementValidation: function (elementID, err1) {
    var thisElementValue = $('#' + elementID).val()
    err1 !== undefined && err1.error === 'empty' ? thisElementValue = '' : null

    if (err1 !== undefined) {
            // console.log('#selectElementValidation > err1:', elementID, ' :: ', err1, ' :: ', thisElementValue);
    } else {
            // console.log('#selectElementValidation > no err1:', elementID, ' :: ', thisElementValue);
    }

    if (thisElementValue !== '') {
      if (isSafari) {

                // ++++

      }

      $('#' + elementID + 'Error').text('')
      $('#' + elementID + 'Error').removeClass('show').addClass('hide')

      !isSafari ? $('#' + elementID).get(0).setCustomValidity('') : null
    } else {
      isSafari ? $('#' + elementID + 'Error').text('Please select an option. ' + $('#' + elementID).attr('title')) : null

      err1 !== undefined && !isSafari ? $('#' + elementID + 'Error').text('Please select an item in the list.') : null

      if ((err1 !== undefined && !isSafari) || isSafari) {
        $('#' + elementID + 'Error').removeClass('hide').addClass('show')
      }
    }
  },

  elementIDtoTitleCase: function (whichID) {
    whichID = whichID.replace(/([A-Z])/g, ' $1')
    var labelText = whichID.replace(/^./, function (str) { return str.toUpperCase() })
    return labelText
  },

  testUserInput: function (elementID, pattern, err1) {
    if (err1 !== undefined) {
            // console.log('#testUserInput > err1: ', elementID, ' :: ', pattern, ' :: ', err1);
    } else {
            // console.log('#testUserInput > no err1: ', elementID, ' :: ', pattern);
    }

    var thisElementValue = $('#' + elementID).val()
    err1 !== undefined && err1.error === 'empty' ? thisElementValue = '' : null

    var patternTestValue = pattern.test(thisElementValue)
    err1 !== undefined && err1.error === 'invalid' ? patternTestValue = false : null

    var charCount = thisElementValue.length
    err1 !== undefined && err1.stringValLength ? charCount = err1.stringValLength : null

    var errorElement = $('#' + elementID + 'Error')
    var title = $('#' + elementID).attr('title')

    if (thisElementValue === '') {
      isSafari ? errorElement.text('Please fill out this field. ' + title) : null
      err1 !== undefined && !isSafari ? errorElement.text('Please fill out this field.') : null

      if ((err1 !== undefined && !isSafari) || isSafari) {
        errorElement.removeClass('hide').addClass('show')
      }
    } else if (charCount < 4) {
      if (elementID.indexOf('confirm') !== -1) {
        isSafari ? errorElement.text('Invalid input. ' + title) : null
      } else {
        isSafari ? errorElement.text('Please enter at least 4 character(s). You entered ' + charCount + '. ' + title) : null
      }

      err1 !== undefined && !isSafari ? errorElement.text('Please match the requested format. ' + title) : null

      if ((err1 !== undefined && !isSafari) || isSafari) {
        errorElement.removeClass('hide').addClass('show')
      }
    } else if (charCount >= 4) {
      if (!patternTestValue) {
        isSafari ? errorElement.text('Invalid input. ' + $('#' + elementID).attr('title')) : null
        err1 !== undefined && !isSafari ? errorElement.text('Please match the requested format. ' + title) : null

        if ((err1 !== undefined && !isSafari) || isSafari) {
          errorElement.removeClass('hide').addClass('show')
        }

        if (err1 !== undefined && err1.lengthError === 'maxlength') {
          var newVal = helper.validateMaxLengthUserInput($('#' + elementID).val(), err1.stringValLength)
          $('#' + elementID).val(newVal)
        }
      } else {
        errorElement.text('')
        errorElement.removeClass('show').addClass('hide')

        !isSafari ? $('#' + elementID).get(0).setCustomValidity('') : null
        $('#' + elementID).off('input')
      }
    }
  },

  validateEmailValue: function (email) {
    var pattern = helper.pattern.email
    return pattern.test(email)
  },

  validateParams: function (str1, str2, err1) {
    if (err1 !== undefined) {
            // console.log('## validateParams > err1: ', str1, ' || ', str2, ' || ', err1)
    } else {
            // console.log('## validateParams > no err1: ', str1, ' || ', str2)
    }

    if ((err1 !== undefined && (err1.error === 'nomatch' || err1.error === 'match')) || $('#' + str2).val() !== '') {
      var property1 = document.getElementsByName(str1)[0]
      var property2 = document.getElementsByName(str2)[0]

      if ((err1 !== undefined && err1.error === 'nomatch') || property1.value !== property2.value) {
        if (isSafari) {
          if (str2 === 'email') {
            $('#' + str1 + 'Match').removeClass('hide').addClass('show')
          } else {
            $('#' + str2 + 'Match').removeClass('hide').addClass('show')
          }
        } else {
          if (err1 !== undefined) {
            $('#' + str2 + 'Match').removeClass('hide').addClass('show')
          } else {
            $('#' + str2).get(0).setCustomValidity(helper.elementIDtoTitleCase(str1) + 's don\'t match')
          }
        }
      } else {
        if (isSafari) {
          if (str2 === 'email') {
            $('#' + str1 + 'Match').removeClass('show').addClass('hide')
          } else {
            $('#' + str2 + 'Match').removeClass('show').addClass('hide')
          }
        } else {
          if (err1 === undefined) {
            $('#' + str1).get(0).setCustomValidity('')
            $('#' + str2).get(0).setCustomValidity('')
          } else {
            $('#' + str2 + 'Match').removeClass('show').addClass('hide')
          }
        }
        if (str1 === 'email' || str1 === 'confirmEmail') {
          var valdata = $('#signUpForm').data('validatedData')
          var v

          if (valdata) {
            Object.keys(valdata).forEach(function (p) {
              if (p !== 'email' || p !== 'confirmEmail') {
                if (valdata[p].error === 'match' || valdata[p].error === false) {
                  v = true
                }
              }
            })

            v === true ? $('#signUpForm').submit() : null
          }
        }
      }
    }
  },

  testUserInputEmail: function (elementID, err1) {
    var thisElementValue = $('#' + elementID).val()
    var thisErrorElement = $('#' + elementID + 'Error')
    var title = $('#' + elementID).attr('title')
    var isEmailValid

    err1 === undefined ? isEmailValid = helper.validateEmailValue(thisElementValue) : null

    if ((err1 !== undefined && (err1.error === 'false' || err1.error === 'match')) || (err1 === undefined && isEmailValid)) {
      err1 !== undefined || isSafari ? thisErrorElement.text('') : null
      err1 !== undefined || isSafari ? thisErrorElement.removeClass('show').addClass('hide') : null
      $('#' + elementID).off('input')
    } else if ((err1 !== undefined && err1.error === 'empty') || thisElementValue === '') {
      err1 !== undefined || isSafari ? thisErrorElement.text('Please fill out this field. ' + title) : null
      err1 !== undefined || isSafari ? thisErrorElement.removeClass('hide').addClass('show') : null
    } else if ((err1 !== undefined && err1.error === 'invalid') || (err1 === undefined && !isEmailValid)) {
      err1 !== undefined || isSafari ? thisErrorElement.text('Please enter an email address. ' + title) : null
      err1 !== undefined || isSafari ? thisErrorElement.removeClass('hide').addClass('show') : null
    }
  },

  validateEmailService: function (email, callback) {
    var data = {}
    var pathName = 'email'
    var err
    data[pathName] = email
    pathName = 'expectedResponse'
    data[pathName] = 'false'
    helper.showLoading()

    data['_csrf'] = $('meta[name="csrf-token"]').attr('content')

    $.ajax({
      rejectUnauthorized: false,
      url: 'https://localhost:3000/api/evaluateuseremail',
      type: 'POST',
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      accepts: 'application/json',
      async: true,

      success: function (data, status, xhr) {
        if (data.response === 'success') {
          callback(null, true)
        } else {
          err = new Error('error')
          callback(err, false)
        }

        helper.hideLoading()
      },

      error: function (xhr, status, error) {
        var parsedXHR = JSON.parse(xhr.responseText)

        location.href = parsedXHR.redirect
      }
    })
  },

  validateEmailField: function (elementVal, thisField, comparedField, err1) {
    if (err1 !== undefined) {
            // console.log('#validateEmailField > err1: ', thisField, ' :: ', err1)
    } else {
            // console.log('#validateEmailField > no err1: ', thisField)
    }

    var isEmailValid

    err1 === undefined || err1.error === 'false' ? isEmailValid = helper.validateEmailValue(elementVal) : null

        // EMAIL IS VALID +++++++++++++++++++
    if ((err1 !== undefined && (err1.error !== 'invalid' && err1.error !== 'empty')) || isEmailValid) {
      err1 !== undefined || isSafari ? $('#' + thisField + 'Improper').removeClass('show').addClass('hide') : null
      !isSafari ? $('#' + thisField).get(0).setCustomValidity('') : null
      $('#' + thisField).off('input')

      if (isEmailValid) {
        helper.validateEmailService(elementVal, function (err, response) {
          if (err) {
            isSafari ? $('#' + thisField + 'Registered').removeClass('hide').addClass('show') : null
            !isSafari ? $('#' + thisField).get(0).setCustomValidity('This email address is already in our system. Sign in, or enter a new email address') : null

            err1 !== undefined ? helper.testUserInputEmail(thisField, err1) : null
          } else {
            isSafari ? $('#' + thisField + 'Registered').removeClass('show').addClass('hide') : null

            helper.validateParams(thisField, comparedField)

            err1 !== undefined ? helper.testUserInputEmail(thisField, err1) : null
          }
        })
      } else {
        if (err1 !== undefined && err1.error === 'registered') {
          $('#' + thisField + 'Registered').removeClass('hide').addClass('show')
        } else {
          helper.validateParams(thisField, comparedField, err1)
        }
        err1 !== undefined ? helper.testUserInputEmail(thisField, err1) : null
      }

        // EMAIL IS NOT VALID +++++++++++++++++++
    } else if ((err1 !== undefined && err1.error === 'invalid') || (err1 === undefined && !isEmailValid)) {
      if (err1 !== undefined || isSafari) {
        $('#' + thisField + 'Registered').removeClass('show').addClass('hide')
        $('#' + thisField + 'Improper').removeClass('hide').addClass('show')
      } else {
        $('#' + thisField).get(0).setCustomValidity(helper.elementIDtoTitleCase(thisField) + ' is in improper format')
      }
      $('#' + thisField).focus()
      err1 !== undefined ? helper.testUserInputEmail(thisField, err1) : null
    } else if (err1 !== undefined && err1.error === 'empty') {
      helper.testUserInputEmail(thisField, err1)
    }
  },

  postData: function () {
    var data = {
      displayname: $('#displayname').val(),
      email: $('#email').val(),
      confirmEmail: $('#confirmEmail').val(),
      password: $('#password').val(),
      confirmPassword: $('#confirmPassword').val(),
      firstname: $('#firstname').val(),
      lastname: $('#lastname').val(),
      city: $('#city').val(),
      state: $('#state').val()
    }
    return data
  },

  formatDate: function (date) {
    return (date.getHours() < 10 ? '0' : '') + date.getHours() +
               ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() +
               ':' + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds() +
               '.' + (date.getMilliseconds() < 10 ? '00' : (date.getMilliseconds() < 100 ? '0' : '')) +
               date.getMilliseconds()
  },

  handleErrorResponse: function (data) {
    Object.keys(data).forEach(function (p) {
      switch (p) {
        case 'displayname':
          helper.testUserInput(p, helper.pattern.displayname, data[p])
          break

        case 'email':
          helper.validateEmailField(null, 'email', 'confirmEmail', data[p])
          break

        case 'confirmEmail':
          helper.validateEmailField(null, 'confirmEmail', 'email', data[p])
          break

        case 'password':
          if (helper.validateParams('password', 'confirmPassword', data[p])) {
            $('#confirmPassword').off('input')
          }
          helper.testUserInput(p, helper.pattern.password, data[p])
          break

        case 'confirmPassword':
          if (helper.validateParams('password', 'confirmPassword', data[p])) {
            $('#password').off('input')
          }
          helper.testUserInput(p, helper.pattern.password, data[p])
          break

        case 'firstname':
        case 'lastname':
        case 'city':
          helper.textElementValidation(p, helper.pattern.basictext, data[p])
          break

        case 'state':
          helper.selectElementValidation(p, data[p])
          break
      }
    })
  }

}

$(function () {
  helper.init()
})
