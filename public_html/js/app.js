/* global Backbone, moment, _,$, Pikaday, Firebase */

'use strict';

/****************APP OBJECT*********************/
/*app object will store all the Health Tracker's objects, including Bacbone models, views etc.
 At first Pikaday object is being created for selection of dates. 
 [https://github.com/dbushell/Pikaday]
 Additionally Moment.js is being used to format dates [http://momentjs.com/]. 
 - [app.picker] - creates Pikaday object. 
 Sets min date to 01st of December and max date to the day when app is load.
 [onSelect](when new date is selected) object will assign new date to [app.currentDay] and
 initialize Bacbone Firebase collection [app.currentFood] which is linked to Firebase database,
 and pulls information for selected date. Function also uses [app.router.navigate] to keep track
 of selected dates, so later user can use back button.
 - [app.dateHandler] stores jQuery events for managing buttons.
 [#left] & [#right] are the buttons next to date filed, moment js subtracts or adds date. Then new date
 is set [app.picker.setDate()] which also triggers [onSelect] function. [.btn] event is to 
 prevent reloading of the page.
- [firebaseUrl] variable is being assigned which is used for the user authentatcion and Firebase Backbone Collection
- [userId] variable assigned once user is logged in. 
Used for retreving right information from Firebase (data is grouped under userid --> date --> food item)
 */


var app = {
    picker: new Pikaday({
        field: $('#datepicker')[0],
        format: 'YYYY-MMM-DD',
        minDate: moment('2015-12-01', 'YYYY-MM-DD').toDate(),
        maxDate: new Date(),
        onSelect: function () {
            app.currentDay = moment(app.picker.toString(), 'YYYY-MMM-DD').format('YYYYMMDD');
            app.currentFood.initialize();
            var link = "date/" + app.currentDay;
            app.router.navigate(link, {
                trigger: true
            });
        }
    }),
    currentDay: moment().format('YYYYMMDD'),
    loadDay: moment().format('YYYY-MMM-DD'),
    dateHandler: function () {
        $('#left').click(function () {
            var temp = moment(moment(app.picker.toString('YYYY-MM-DD'), 'YYYY-MM-DD').
                    subtract(1, 'days')).format('YYYY-MMM-DD');
            app.picker.setDate(temp);
        });
        $('#right').click(function () {
            var temp = moment(moment(app.picker.toString('YYYY-MM-DD'), 'YYYY-MM-DD').
                    add(1, 'days')).format('YYYY-MMM-DD');
            app.picker.setDate(temp);
        });
        $(".btn").click(function (event) {
            event.preventDefault();
        });
    },
    firebaseUrl: 'https://thefullresolution-ht.firebaseio.com/',
    userId: ''
};


/****************Log In OBJECT*********************/
/*Object for all the log in functions.
Since there is little DOM manipulation involved I decided to create custom object,
instead of using Backbone -  this way it was simpler to add slide down log in form,
errors and Icons.

At first several variables are declared to assign using Jquery DOM elements. Additionally
[this.logStatus] is being assigned used by [this.render] function.
Then templates for displaying state of being logged in in the right upper corner
of the site. 
- [this.render] base on variable [this.logStatus] is uses the right template to
display log in status. Since it is not backbone, function is being called manually.
- [this.buttonHandler] (at the bottom of object) self-invoking function, for handling
users’ interactions with buttons. The way first two events are assigned allows
to bond events to buttons even when they are stop being rendered. 
---First event pulls down login form
---Second event calls [this.signOut] function
---Third event calls [this.signIn] by passing user's email value and password, 
assigns empty log status, calls render so loading icon will be displayed until 
the response will come. Finally log in form is being hidden. 
- [this.signIn] uses [authWithPassword] method to log in a user. [app.firebase] 
is a Firebase (object created below [app.loginForm] when document is ready).
If response from Firebase was error, function [this.error] is being called 
with matching error message. Else [this.logStatus] is changed to yes, 
render function is being called to change "Login" to User icon. 
Additionally [app.userId] is being assigned and [app.picker.setDate(app.loadDay);] is called.
which triggers initialization of Firebase collection. 
 */


app.loginForm = function () {
    var self = this;
    this.loginDiv = $('#login');
    this.email = $('#inputEmail');
    this.pass = $('#inputPassword');
    this.logStatus = 'no';

    this.templateNot = '<a href="#!" class="btn" id="loginButton"  role="button">' +
            '<p class="head" style="font-size: 1.3em">Login</p></a>';
    this.templateLoading = '<i class="fa fa-spinner fa-pulse fa-2x"></i>';
    this.templateYes = '<i class="fa fa-user-md"></i>' +
            '<a href="#!" class="btn" id="singOut"  role="button"><i class="fa fa-sign-out"></i></a>';



    this.render = function () {
        if (self.logStatus === 'yes') {
            self.loginDiv.html(self.templateYes);
        } else if (self.logStatus === 'no') {
            self.loginDiv.html(self.templateNot);
        } else {
            self.loginDiv.html(self.templateLoading);
        }
    };
    this.signIn = function (login, password) {
        app.firebase.authWithPassword({
            email: login,
            password: password
        }, function (error, authData) {
            if (error) {
                switch (error.code) {
                    case "INVALID_EMAIL":
                        self.error("The specified user account email is invalid.");
                        break;
                    case "INVALID_PASSWORD":
                        self.error("The specified user account password is incorrect.");
                        break;
                    case "INVALID_USER":
                        self.error("The specified user account does not exist.");
                        break;
                    default:
                        self.error("Error logging user in:", error);
                }
            } else {
                self.logStatus = 'yes';
                self.render();
                self.email.val('');
                self.pass.val('');
                app.userId = authData.uid;
                app.picker.setDate(app.loadDay);
            }
        }, {
            remember: "sessionOnly"
        });
    };
    this.signOut = function () {
        app.firebase.unauth();
        self.logStatus = 'no';
        app.currentFood.initialize();
        app.userId = '';
        self.render();
    };
    this.error = function (msg) {
        $("#errorMsg").text(msg);
        $("#errorForm").slideDown("fast", function () {
            self.logStatus = 'no';
            self.render();
        });
        setTimeout(function(){$("#errorForm").slideUp("slow");}, 4500);
    };
    this.buttonHandler = (function () {
        self.render();
        self.loginDiv.on('click', '#loginButton', function () {
            $("#loginForm").slideDown("slow");
        });
        self.loginDiv.on('click', '#singOut', function () {
            self.signOut();
        });
        $("#signIn").click(function () {
            self.signIn(self.email.val(), self.pass.val());
            self.logStatus = '';
            self.render();
            $("#loginForm").slideUp("fast");
        });

    })();
};

/****************Documnet Ready*********************/
/* Once document is ready, create all the objects and start router*/

$(function () {
    app.firebase = new Firebase(app.firebaseUrl);
    app.autoView = new app.AutoCompeletListView();
    app.currentSearch = new app.SearchViewList();
    app.currentFood = new app.FoodListView();
    app.router = new app.Router();
    Backbone.history.start({pushState: true});
    app.dateHandler();
    app.loginForm();
});