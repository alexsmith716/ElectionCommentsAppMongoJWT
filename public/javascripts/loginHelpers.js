/* global $ */
/* global isSafari */
/* global location */
var helper = {

    init: function() {

        window.showLoading = function() {
            $('.modal-backdrop').show();
        };
        window.hideLoading = function() {
            $('.modal-backdrop').hide();
        };

        showLoading(); 

        setTimeout(function() { hideLoading(); }, 500);

        helper.initializeJqueryEvents();
    },

    initializeJqueryEvents:  function(){

        var emailPattern = /^\S+@\S+\.\S+/;
        var passwordPattern = /^\S{4,}$/;

        $('#forgotPasswordAnchor').click(function(){
            $('#forgotPasswordFormModal').modal({
                keyboard: false,
                backdrop: 'static'
            })
        });


        $('#forgotPasswordFormModal').on('hidden.bs.modal', function () {
            $("#forgotPasswordForm").get(0).reset();
            $('#forgotPassword').removeAttr('disabled');
            $('#forgotPasswordForm .loginerror').removeClass('show').html('');
            $('#forgotPasswordForm .formerror').removeClass('show');
            $('#forgotPassword').removeClass('has-error');
            $('.modalAlertWarning').hide();
            $('.modalOkayBtn').hide();
            $('.modalCancelSubmitBtns').show();
        });


        $('#forgotPasswordForm').on('submit', function(e) {

            e.preventDefault();

            $('#forgotPassword').removeClass('has-error');
            $('#forgotPasswordForm .loginerror').removeClass('show').html('');

            var data = {};
            var email = $('#forgotPassword').val();
            var isEmailValid = emailPattern.test(email);
            var serviceUrl = $(this).attr('action');

            if (email === '') {
                $('#forgotPassword').addClass('has-error');
                $('#forgotPasswordForm .loginerror').addClass('show').html('Please enter email');
                return false;
            }
            if (!isEmailValid) {
                $('#forgotPassword').addClass('has-error');
                $('#forgotPasswordForm .loginerror').addClass('show').html('Please enter your valid email');
                return false;
            }

            $('.loading').show();

            console.log('##### > forgotPasswordForm submit > email: ', email)

            data = {
                email: email
            };

            data['_csrf'] = $('meta[name="csrf-token"]').attr('content');
            
            $.ajax({
                
                rejectUnauthorized: false,
                url: serviceUrl,
                type: 'POST',
                data: JSON.stringify(data),
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                accepts: 'application/json',

                success: function(data, status, xhr) {

                    if (data.response === 'success') {

                        $('#forgotPassword').attr('disabled', 'true');
                        $('.modalAlertWarning').show();
                        $('.modalOkayBtn').show();
                        $('.modalCancelSubmitBtns').hide();
                        $('.loading').hide();

                    } else {

                        $('#forgotPassword').addClass('has-error');
                        $('#forgotPasswordForm .loginerror').addClass('show').html('Please enter a valid email address');

                        //helper.handleErrorResponse(data.validatedData);

                        $('.loading').hide();
                        return false;
                    }
                },

                error: function(xhr, status, error) {

                    var parsedXHR = JSON.parse(xhr.responseText);

                    location.href = parsedXHR.redirect;

                    return false;

                }
            });
        });


        $('#forgotPassword').on('keypress', function(e) {
            var key = e.keyCode;
            if (key === 13) {
                $('#forgotPasswordForm').submit();
            }
        });


        $('#loginForm').on('submit', function(e) {

            e.preventDefault();
            showLoading();

            $('#loginForm .formerror').removeClass('show').addClass('hide');
            $('#loginForm .loginerror').removeClass('show');
            $('#loginForm .form-control').removeClass('has-error');

            var data = {};
            var email = $('#login-email').val();
            var password = $('#login-password').val();
            var serviceUrl = $(this).attr('action');
 
            if (email === '' || password === '') {

                hideLoading();
                return false;

            }else{

                data = {
                    email: email,
                    password: password
                };

                data['_csrf'] = $('meta[name="csrf-token"]').attr('content');

                $.ajax({

                    rejectUnauthorized: false,
                    url: serviceUrl,
                    type: 'POST',
                    data: JSON.stringify(data),
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    accepts: 'application/json',

                    success: function(data, status, xhr) {

                        if (data.response === 'success') {

                            console.log('>>> loginForm >>> 1: ', data)

                            // localStorage.getItem('token')
                            //location.href = data.redirect;

                        } else {

                            console.log('>>> loginForm >>> 2: ', data)

                            if(data.validatedData){
                                $('#loginForm .form-control').addClass('has-error');
                                $('#loginForm .loginerror').addClass('show');
                                $('#loginForm .loginerror').html('Email and Password don\'t match. Please try again.');
                                //helper.handleErrorResponse(data.validatedData);
                            }else{
                                $('#loginForm .formerror').removeClass('hide').addClass('show');
                            }

                            hideLoading();
                            return false;
                        }
                    },

                    error: function(xhr, status, error) {

                        console.log('>>> loginForm >>> 3: ', xhr)

                        var parsedXHR = JSON.parse(xhr.responseText);

                        location.href = parsedXHR.redirect;

                        return false;

                    }
                });
            }
        });
    },

    saveToken: function (token) {
        localStorage.setItem('user-token', token);
    },

    clearToken: function () {
        localStorage.removeItem('user-token');
    },

    showLoading: function() {
        $('.modal-backdrop').show();
    },

    hideLoading: function() {
        $('.modal-backdrop').hide();
    },


    clearForgotPassword: function() {
        $("#forgotPasswordForm").get(0).reset();
        $('#forgotPassword').removeAttr('disabled');
        $('#forgotPasswordForm .loginerror').removeClass('show').html('');
        $('#forgotPasswordForm .formerror').removeClass('show');
        $('#forgotPassword').removeClass('has-error');
        $('.modalAlertWarning').hide();
        $('.modalOkayBtn').hide();
        $('.modalCancelSubmitBtns').show();
    },

    handleErrorResponse: function(data) {

        Object.keys(data).forEach(function(p) {
           
            switch (p) {

                case 'email':
                    // console.log('handleErrorResponse: ', p, ' :: ', data[p]);
                    break;
   
                case 'password':
                    // console.log('handleErrorResponse: ', p, ' :: ', data[p]);
                    break;
            }

        });
    },

}

$(function () {
    helper.init();
});

