/* global Backbone, resp, moment, _ */

'use strict';


/* Whole document is divided by sections where models, 
 collections and views are grouped together for easier review of the code.
 I on purpose ignored suggested structure of folders and files for Bacbone app - 
 I find this way easier to manage my code. */




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

app.loginForm = function () {
    var self = this;
    this.loginDiv = $('#login');

    this.templateNot = '<a href="#!" class="btn" id="loginButton"  role="button">' +
            '<p class="head">Login</p></a>';
    this.templateLoading = '<i class="fa fa-spinner fa-pulse fa-2x"></i>';
    this.templateYes = '<i class="fa fa-user-md"></i>' +
            '<a href="#!" class="btn" id="singOut"  role="button"><i class="fa fa-sign-out"></i></a>';

    this.email = $('#inputEmail');
    this.pass = $('#inputPassword');
    this.logStatus = 'no';

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
                console.log("Login Failed!", error);
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

/****************ROUTER Backbone*********************/
/*Simple router which keep tracks of selected dates.
 Once user go back (or forward) it set date of picker to date from url*/

app.Router = Backbone.Router.extend({
    'routes': {
        '': 'index',
        'index.html': 'index',
        'date/:id': 'show'
    },
    index: function () {
        app.picker.setDate(app.loadDay);
    },
    show: function (id) {
        app.picker.setDate((moment(id, 'YYYYMMDD').format('YYYY-MMM-DD')));
    }
});


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



/*****************AUTO COMPLETE*********************
 Auto Complete uses Nutritionix API Autocomplete 
 [https://developer.nutritionix.com/docs/v2/autocomplete].
 It will display datalist suggestions under the search input, once user will start typing.
 */

/*AutoCompeletItem is Backbone Model for storing text*/

app.AutoCompeletItem = Backbone.Model.extend({
    defaults: {
        text: ''
    }
});

/*AutoCompeletCollection - Bacbone Collection. 
 Default [sync] is overwritten to get information from the server.
 - appID and appKey is stored in object [nutritionix]
 - url is returned in function together with user's query
 [parse] function will process the response.
 - if return is empty it will trigger error, which will be handled in app.AutoCompeletListView.
 - else it will reset collection to create list of suggestions.*/

app.AutoCompeletCollection = Backbone.Collection.extend({
    model: app.AutoCompeletItem,
    query: '',
    nutritionix: {
        appId: 'f133e02a',
        appKey: 'be061c14a88c6a28fedae1b0fe7a71d3'
    },
    url: function () {
        return 'https://api.nutritionix.com/v2/autocomplete?q=' + this.query;
    },
    sync: function (method, model, options) {
        options.type = 'GET';
        options.url = this.url();
        options.data = $.param(this.nutritionix);
        Backbone.sync.call(this, method, model, options);
    },
    parse: function (searchReturn) {
        if (!searchReturn.length) {
            this.trigger('error', this);
        } else {
            var searchCollection = _.map(searchReturn, function (item) {
                return {
                    text: item.text
                };
            });
            this.reset(searchCollection);
        }
    }
});

/*Bacbone View for each model, uses simple template to paste autocomplete text*/

app.AutoCompeletItemView = Backbone.View.extend({
    template: _.template('<option value="<%= text %>">'),
    render: function () {
        var foodItem = this.model.toJSON();
        this.$el.html(this.template(foodItem));
        return this;
    }
});

/*AutoCompeletListView - Backbone collection
 - [el] is defined as #searchArea to track if user types something in search input.
 - [keyup] event triggers [auto] function.
 - [auto] function checks if the value of input is bigger than 0.
 If yes, the collection's query is being defined and [fetch] is being called.
 If no, the [renderError] function is being called.
 - [initialize] creates collection, assign [this.list] to element in the DOM
 listens to reset and error, which is triggered in case of no response from server.
 - [renderError] empties DOM element in case of error. 
 - [reneder] appends all elements to datalist. */

app.AutoCompeletListView = Backbone.View.extend({
    el: $('#searchArea'),
    events: {
        'keyup': 'auto'
    },
    initialize: function () {
        this.collection = new app.AutoCompeletCollection();
        this.list = $('#autoComplete');
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'error', function (collection) {
            this.renderError();
        });
    },
    render: function () {
        var self = this;
        self.list.empty();
        self.collection.each(function (foodItem) {
            var item = new app.AutoCompeletItemView({
                model: foodItem
            });
            self.list.append(item.render().el);
        });
    },
    renderError: function () {
        this.list.empty();
    },
    auto: function () {
        var val = $('#food').val().trim();
        if (val.length > 0) {
            this.collection.query = val;
            this.collection.fetch();
        } else {
            this.renderError();
        }
    }
});

/*****************FOOD ITEM********************/
/*Backbone model used by SEARCH RESULTS collection and 
 TRACKED FOOD ITEMS collection*/

app.FoodItem = Backbone.Model.extend({
    defaults: {
        id: '',
        name: '',
        weight: '',
        calories: '',
        qty: 1,
        unit: '',
        edit: 'no'
    }
});

/*****************SEARCH RESULTS********************/
/*SearchFoodCollection - Bacbone Collection. 
 Default [sync] is overwritten to get information from the server.
 - fields (which limits amount of data we receive form server),
 appID and appKey is stored in object [nutritionix]
 - url is returned in function together with user's query
 [parse] function will process the response.
 - if return is empty it will trigger error, which will be handled in app.AutoCompeletListView.
 It passes the text which will be displayed under input filed. 
 - else it will reset collection to create list of models,
 with all the information displayed in the app.*/

app.SearchFoodCollection = Backbone.Collection.extend({
    model: app.FoodItem,
    query: '',
    nutritionix: {
        fields: 'item_name,nf_calories,nf_serving_weight_grams,\n\
nf_serving_size_qty,nf_serving_size_unit',
        appId: 'f133e02a',
        appKey: 'be061c14a88c6a28fedae1b0fe7a71d3'
    },
    url: function () {
        return 'https://api.nutritionix.com/v1_1/search/' + this.query;
    },
    sync: function (method, model, options) {
        options.url = this.url();
        options.data = $.param(this.nutritionix);
        Backbone.sync.call(this, method, model, options);
    },
    parse: function (searchReturn) {
        if (!searchReturn.hits.length) {
            this.trigger('error', this, {
                'statusText': 'Sorry, no results...'
            });
        } else {
            var searchCollection = _.map(searchReturn.hits, function (item) {
                var nameFood = item.fields.item_name.replace(/ *\([^)]*\) */g, "");
                var unitFood = item.fields.nf_serving_size_unit.replace(/ *\([^)]*\) */g, "");
                return {
                    id: item._id,
                    name: nameFood,
                    weight: item.fields.nf_serving_weight_grams,
                    calories: item.fields.nf_calories,
                    qty: item.fields.nf_serving_size_qty,
                    unit: unitFood
                };
            });
            this.reset(searchCollection);
        }
    }
});

/* SearchViewItem  - Backbone View
 View used for displaying each table row in the search results, 
 additionally handling the event when user will click on of the rows
 and adds the model to the app.FoodCollection [addItem].*/

app.SearchViewItem = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($('#search_result_template').html()),
    events: {
        'click': 'addItem'
    },
    render: function () {
        var foodItem = this.model.toJSON();
        this.$el.html(this.template(foodItem));
        return this;
    },
    addItem: function (event) {
        event.preventDefault();
        var newModel = this.model.clone();
        app.currentFood.collection.add(newModel);
        app.currentSearch.cleanupAdd();
    }
});

/*SearchViewList - Backbone View
 - [el] is defined as #searchArea, where search input is stored and results table.
 - [click #searchBtn] event triggers [search] function.
 - [search] reads the value in the input and assign it to the collection so query can 
 be passed in the server request and calls [.fetch();]. Additionally it calls [cleanup] function 
 - [cleanup] functions empties all the objects in under search area, 
 including possible error message from previous search. Additionally it displays loader.gif, 
 in case the server response will take more time. 
 - [click .clear] event is being triggered when user click 'x' button. Then
 function [cleanupAdd], remove results (without adding load gif).
 - [initialize] creates variables for different elements in the DOM,
 hide table so no headers being displayed, creates the collection [new app.SearchFoodCollection();].
 Also listens to reset (triggers [render]) and error (triggers [renderError]).
 - [render] appends all the views to [tableObject] so jQuery animation can be called when all the views
 being appended. Next it removes the loader.gif and displays the table.
 - [renderError] removes loader.gif and displays the error message instead of table with results.*/

app.SearchViewList = Backbone.View.extend({
    el: $('#searchArea'),
    templateError: _.template('<h4 class="text-muted head"><%= name %></h4>'),
    events: {
        'click #searchBtn': 'search',
        'click .clear': 'cleanupAdd'
    },
    initialize: function () {
        this.results = $('tbody', '#searchResult');
        this.table = $('#searchResult');
        this.error = $('#error');
        this.table.hide();
        this.tableObject = document.createDocumentFragment();
        this.collection = new app.SearchFoodCollection();
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'error', function (collection, error) {
            this.renderError(error.statusText);
        });
    },
    render: function () {
        var self = this;

        self.collection.each(function (foodItem) {
            var item = new app.SearchViewItem({
                model: foodItem
            });
            self.tableObject.appendChild(item.render().el);

        });
        self.$('#loader').slideUp(400, function () {
            self.table.fadeIn(400, function () {
                self.results.append(self.tableObject).hide().fadeIn(600);
            });
        });
    },
    renderError: function (statusText) {
        var self = this;
        self.$('#loader').slideUp(400, function () {
            self.error.append(self.templateError({name: statusText}));
        });
    },
    cleanup: function () {
        this.results.empty();
        this.error.empty();
        this.table.hide();
        this.$('#loader').fadeIn();
        $('#food').val('').focus();
    },
    cleanupAdd: function () {
        this.results.empty();
        this.table.hide();
    },
    search: function () {
        var val = $('#food').val().trim();
        this.cleanup();
        this.collection.query = val;
        this.collection.fetch();
    }
});


/*****************TRACKED FOOD ITEMS********************/

/*FoodCollection - Backbone Firebase Collection
 Collection used to easly sync data with Firebase database.
 */

app.FoodCollection = Backbone.Firebase.Collection.extend({
    model: app.FoodItem,
    url: function () {
        var root = app.firebaseUrl;
        var user = app.userId;
        var id = app.currentDay;
        if (user === '') {
            return root;
        } else {
            return root + '/' + user + '/' + id;
        }
    }
});


/*FoodItemView - Backbone View
 View for each table row displayed for 'added' food items.
 View uses two templates, one for standard display and one for editing 
 qty of tracked food items. 
 - [click .remove] is triggered when user presses 'x' button, 
 calls function [remove] which destroys the model.
 - [click .edit] is triggered when user press 'pencil' button,
 calls [edit] function which sets model's value of 'edit' to 'yes'. 
 This will trigger model change and assign different template during rendering.
 - [click .update] is triggered when user is done with editing qty, 
 calls [update] function, which reads input with qty, gets model's weight and calories,
 multiply them by input qty and sets new values for all three. And changes 'edit' value to 'no'.
 - [keyup .inputqty] checks if user wanted to confirm change with enter key instead on screen button.
 Then calls [update] function.
 - [render] checks if 'edit' value is 'yes' and then uses the matching template.*/

app.FoodItemView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($('#food_list_template').html()),
    templateEdit: _.template($('#food_list_template_update').html()),
    events: {
        'click .remove': 'remove',
        'click .edit': 'edit',
        'click .update': 'update',
        'keyup .inputqty': "enter"
    },
    initialize: function () {
        this.model.on('change', this.render, this);
        this.model.on('remove', this.render, this);
    },
    render: function () {
        var foodItem = this.model.toJSON();
        var temp;
        if (this.model.get('edit') === "yes") {
            temp = this.templateEdit;
        } else {
            temp = this.template;
        }
        this.$el.html(temp(foodItem));
        return this;
    },
    remove: function () {
        this.model.destroy();
    },
    edit: function () {
        this.model.set('edit', 'yes');
    },
    update: function () {
        var qty = this.$('.inputqty').val();
        var weight = this.model.get('weight') * qty;
        var calories = this.model.get('calories') * qty;
        this.model.set({
            weight: weight,
            calories: calories,
            qty: qty,
            edit: 'no'
        });
    },
    enter: function (event) {
        if (event.keyCode === 13) {
            this.update();
        }
    }
});

/*FoodListView - Backbone View
 - [el] is defined as #foodArea, where table with tracked information being displayed.
 - [render] appends all the views to [this.result] which is declared in [initialize],
 - [calculateKcal] is being called during [render] to sum up daily calories intake.
 */

app.FoodListView = Backbone.View.extend({
    el: $('#foodArea'),
    initialize: function () {
        this.collection = new app.FoodCollection();
        this.results = $('tbody', '#food_list');
        this.listenTo(this.collection, 'add', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'sync', this.render);
        this.render();
    },
    render: function () {
        var self = this;

        this.cleanup();
        this.calculateKcal();
        self.collection.each(function (foodItem) {
            var item = new app.FoodItemView({
                model: foodItem
            });
            self.results.append(item.render().el);
        });

    },
    cleanup: function () {
        this.results.empty();
    },
    calculateKcal: function () {
        var self = this;

        var totalKcal = 0;
        self.collection.each(function (foodItem) {
            totalKcal = totalKcal + foodItem.get('calories');
        });
        $('#totalKcal').text((Math.round(totalKcal * 100) / 100) + 'kcal');
    }
});
