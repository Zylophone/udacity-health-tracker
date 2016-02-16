/*****************SEARCH RESULTS********************/
/* SearchViewItem  - Backbone View
 View used for displaying each table row in the search results,
 additionally handling the event when user will click on of the rows
 and adds the model to the app.FoodCollection [addItem] only user is logged in.*/

var app = app || {};

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
    addItem: function () {
        var checkAuth = app.firebase.getAuth();
        if (checkAuth) {
            var newModel = this.model.clone();
            app.currentFood.collection.add(newModel);
            app.currentSearch.cleanupAdd();
        }
    }
});