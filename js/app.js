/* global Backbone, resp */

'use strict';

var app = {};

$(".btn").click(function(event) {
    event.preventDefault();
});

app.SearchFoodItem = Backbone.Model.extend({
    defaults: {
        id: '',
        name: '',
        weight: '',
        calories: '',
        qty: '1',
        unit: ''
    }
});

app.SearchFoodCollection = Backbone.Collection.extend({
    model: app.SearchFoodItem,
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
            console.log('didn\'t work!');
        } else {
            var searchCollection = _.map(searchReturn.hits, function (item) {
                return {
                    id: item._id,
                    name: item.fields.item_name,
                    weight: item.fields.nf_serving_weight_grams,
                    calories: item.fields.nf_calories,
                    qty: item.fields.nf_serving_size_qty,
                    unit: item.fields.nf_serving_size_unit
                };
            });
            this.reset(searchCollection);
            console.log(JSON.stringify(this));
        }
    }
});



app.SearchViewItem = Backbone.View.extend({
    tagName : 'tr',
    template: _.template($('#search_result_template').html()),
    initialize: function () {
        this.render();
        this.model.on('change', this.render, this);
    },
    render: function () {
        var foodItem = this.model.toJSON();
        this.$el.html(this.template(foodItem));
        return this;
    }
});

app.SearchViewList = Backbone.View.extend({
    el: $('#searchArea'),
    events: {
        'click #searchBtn' : 'search'
    },
    initialize: function () {
        this.collection =  new app.SearchFoodCollection();
        this.listenTo(this.collection, 'reset', this.render);
    },
    render: function () {
        var self = this;
        self.$('#searchResult').html('');
        this.collection.each(function (foodItem) {
            var foodView = new app.SearchViewItem({
                model: foodItem
            });
            self.$('#searchResult').append(foodView.render().el);
        }, this);
    },
    search: function() {
        console.log('shit works');
        var val = $('#food').val().trim();
        this.collection.query = val;
        this.collection.fetch();
    }
});

var current = new app.SearchViewList();