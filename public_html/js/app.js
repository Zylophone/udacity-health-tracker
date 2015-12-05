/* global Backbone, resp, moment */

'use strict';

var app = {
    picker : new Pikaday({ 
        field: $('#datepicker')[0],
        format: 'YYYY-MMM-DD',
        minDate: moment('2015-11-01', 'YYYY-MM-DD').toDate(),
        maxDate: moment('2018-01-01', 'YYYY-MM-DD').toDate(),
        onSelect: function() {
            app.currentDay =  moment(app.picker.toString()).format('YYYYMMDD');
            console.log(app.currentDay);
            app.currentFood.initialize();
        }
        
    }),
    currentDay: ''
    
    
};



/* MODEL AND COLLECTIONS */

app.FoodItem = Backbone.Model.extend({
    defaults: {
        id: '',
        name: '',
        weight: '',
        calories: '',
        qty: 1,
        unit: ''
    }
});

app.FoodItemDisplay = Backbone.Model.extend({
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

app.FoodCollection = Backbone.Firebase.Collection.extend({
    model: app.FoodItemDisplay,
    url: function() {
    var root = 'https://thefullresolution-ht.firebaseio.com/';
    var id = app.currentDay;
    return root + id;
  }
});



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
            console.log('worked!');
        }
    }
});

/******************** VIEWS ********************************/

app.FoodItemView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($('#food_list_template').html()),
    templateEdit: _.template($('#food_list_template_update').html()),
    events: {
        'click .remove': 'remove',
        'click .edit': 'edit',
        'click .update': 'update',
        'keyup .inputqty' : "enter"
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
    enter: function(event){
    if(event.keyCode === 13){
        this.update();
    }}
});


app.FoodListView = Backbone.View.extend({
    el: $('#foodArea'),
    initialize: function () {
        this.collection = new app.FoodCollection();
        this.tableObject = document.createDocumentFragment();
        this.results = $('tbody', '#food_list');
        this.listenTo(this.collection, 'add', this.render);
        this.listenTo(this.collection, 'change', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'sync', this.render);
    },
    render: function () {
        var self = this;
        this.results.empty();
        var  totalKcal = 0;
        self.collection.each(function (foodItem) {
             totalKcal = totalKcal + foodItem.get('calories');
        });
        $('#totalKcal').text((Math.round(totalKcal * 100) / 100) + 'kcal');
        self.collection.each(function (foodItem) {
            var item = new app.FoodItemView({
                model: foodItem
            });
            self.tableObject.appendChild(item.render().el);
        });
        self.results.append(self.tableObject).hide().fadeIn(600);

        
    }
});


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
        'click #searchBtn': 'search'
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
            self.error.append(self.templateError({ name: statusText }));
        });
    },
    cleanup: function () {
        this.results.empty();
        this.error.empty();
        this.table.hide();
        this.$('#loader').fadeIn();
        $('#food').val('').focus();
    },
    cleanupAdd: function() {
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

 

$(function () {

    app.picker.gotoToday();
    $('#datepicker').val(moment().format('YYYY-MMM-DD'));
    app.currentDay = moment().format('YYYYMMDD');
    
    $(".btn").click(function (event) {
        event.preventDefault();
    });

    app.currentSearch = new app.SearchViewList();
    app.currentFood = new app.FoodListView();
    
});