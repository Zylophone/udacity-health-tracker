/*****************SEARCH RESULTS********************/
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

var app = app || {};

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