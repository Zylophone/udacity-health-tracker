/*****************TRACKED FOOD ITEMS********************/
/*FoodListView - Backbone View
 - [el] is defined as #foodArea, where table with tracked information being displayed.
 - [render] checks if user is logged in, if yes
 appends all the views to [this.result] which is declared in [initialize],
if no, it will render message that user have to log in. 
 - [calculateKcal] is being called during [render] to sum up daily calories intake.
 */

app.FoodListView = Backbone.View.extend({
    el: $('#foodArea'),
    initialize: function () {
        this.collection = new app.FoodCollection();
        this.table =  $('#food_list');
        this.message = $('#messageLogin');
        this.results = $('tbody', '#food_list');
        this.render();
        this.listenTo(this.collection, 'add', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'sync', this.render);
    },
    render: function () {
        var self = this;
        var checkAuth = app.firebase.getAuth();
        if(checkAuth){
        self.message.slideUp();    
        self.table.fadeIn();
        self.cleanup();
        self.calculateKcal();
        self.collection.each(function (foodItem) {
            var item = new app.FoodItemView({
                model: foodItem
            });
            self.results.append(item.render().el);
        });
    } else {
        self.table.hide();
        self.message.fadeIn();
    }
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
