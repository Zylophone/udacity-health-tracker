/* global Backbone, resp, moment, _ */

'use strict';


/* Whole documemnt is divided by sections where models, 
 collections and views are grouped togerther for easier review of the code.
 I on purpose ignored suggested structure of folders and files for Bacbone app - 
 I find this way easier to manage my code. */



/****************APP OBJECT*********************
 app object will store all the Health Tracker's objects, including Bacbone models, views etc.
 At first Pikaday object is being created for selection of dates. 
 [https://github.com/dbushell/Pikaday]
 Additinally I use Moment.js to format dates [http://momentjs.com/]. 
 Upon date selection, [onSelect:] picker intialize view for app.currentFood,
 which is linked to Firebase and will pull data from databse linked to this date.*/

var app = {
    picker: new Pikaday({
        field: $('#datepicker')[0],
        format: 'YYYY-MMM-DD',
        minDate: moment('2015-12-01', 'YYYY-MM-DD').toDate(),
        maxDate: new Date(),
        onSelect: function () {
            app.currentDay = moment(app.picker.toString()).format('YYYYMMDD');
            app.currentFood.initialize();
            app.router.navigate(app.currentDay, {
                trigger: true
            });
        }
    }),
    currentDay: moment().format('YYYYMMDD')
};

app.Router = Backbone.Router.extend({
    'routes': {
        "index": 'index',
        ":id": "show"
    },
    index : function(){
       $('#datepicker').val(moment().format('YYYY-MMM-DD'));
       app.currentDay = moment().format('YYYYMMDD');
       app.currentFood.initialize();
    },
    show: function(id) {
       $('#datepicker').val(moment(id, 'YYYYMMDD').format('YYYY-MMM-DD'));
       app.currentDay = id;
       app.currentFood.initialize();
    }
});




$(function () {

    app.picker.gotoToday();
    $('#datepicker').val(moment().format('YYYY-MMM-DD'));
    $(".btn").click(function (event) {
        event.preventDefault();
    });


    app.router = new app.Router();
    Backbone.history.start({pushState: true});

    app.autoView = new app.AutoCompeletListView();
    app.currentSearch = new app.SearchViewList();
    app.currentFood = new app.FoodListView();
    app.login = new app.LoginView();
});

app.LoginItem = Backbone.Model.extend({
    defaults: {
        user: '',
        passw: '',
        logged: 'no'
    }
});

app.LoginView = Backbone.View.extend({
    el: $('#login'),
    template: _.template($('#login_update').html()),
    templateLogged: _.template('<p class="head"><%= user %>\n\
<button class="btn" id="signOut"><i class="fa fa-sign-out"></i></i></button></p>'),
    events: {
        'click a': 'login',
        'click #signIn': 'logged',
        'click #signOut': 'signOut'
    },
    initialize: function () {
        this.model = new app.LoginItem();
        this.model.on('change', this.render, this);
    },
    render: function () {
        var self = this;
        var login = this.model.toJSON();
        this.$el.empty();
        if (self.model.get('logged') === "yes") {
            self.$el.html(self.templateLogged(login));
        } else {
            self.$el.html(self.template());
        }
    },
    login: function () {
        this.render();
    },
    logged: function () {
        this.model.set({
            user: $('#inputEmail').val(),
            passw: $('#inputPassword').val(),
            logged: 'yes'
        });
    }
});










/*****************AUTO COMPLETE*********************
 Auto Complete uses Nutritionix API Autocomplete 
 [https://developer.nutritionix.com/docs/v2/autocomplete].
 It will display datalist suggestions under the search input, once user will start typing.
 */

/*AutoCompeletItem is Backbone Model for storing text*/

app.AutoCompeletItem = Backbone.Model.extend({
    defaults: {
        id: '',
        text: ''
    }
});

/*AutoCompeletCollection is Bacbone Collection. 
 It overwrites default [sync] to match API's requerments, additionally [parse] function will trigger error
 if resopnse is empty or [reset] collection and creating models, using the response.*/

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
                    id: item.id,
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
 - [reneder] appends all elements to datalist. 
 */

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

/*****************FOOD ITEM********************
 Backbone model used by SEARCH RESULTS collection and 
 TRACKED FOOD collection*/




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


/*****************SEARCH RESULTS********************
 
 
 
 
 */


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
/**/

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
        console.log('error');
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



app.FoodCollection = Backbone.Firebase.Collection.extend({
    model: app.FoodItem,
    url: function () {
        var root = 'https://thefullresolution-ht.firebaseio.com/';
        var id = app.currentDay;
        return root + id;
    }
});

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

app.FoodListView = Backbone.View.extend({
    el: $('#foodArea'),
    initialize: function () {
        this.collection = new app.FoodCollection();
        this.tableObject = document.createDocumentFragment();
        this.results = $('tbody', '#food_list');
        this.listenTo(this.collection, 'add', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'sync', this.render);
    },
    render: function () {
        var self = this;

        this.calculateKcal();

        self.collection.each(function (foodItem) {
            var item = new app.FoodItemView({
                model: foodItem
            });
            self.tableObject.appendChild(item.render().el);
        });
        this.results.empty();
        this.results.append(self.tableObject);
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


