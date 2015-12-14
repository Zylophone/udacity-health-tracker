/*****************AUTO COMPLETE*********************/
/*AutoCompeletListView - Backbone collection
 - [el] is defined as #searchArea to track if user types something in search input.
 - [keyup] event triggers [auto] function.
 - [auto] function checks if the pressed key is not alt, ctrl, 
 arrows or enter then checks if value of input is bigger than 0.
 If yes, the collection's query is being defined and [fetch] is being called.
 If no, the [renderError] function is being called.
 - [initialize] creates collection, assign [this.list] to element in the DOM
 listens to reset and error, which is triggered in case of no response from server.
 - [renderError] empties DOM element in case of error. 
 - [reneder] appends all elements to datalist. */

app.AutoCompeletListView = Backbone.View.extend({
    el: $('#searchArea'),
    events: {
        'keyup' : 'auto'
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
    auto: function (event) {
        var val = $('#food').val();
        var keyCodes = [17, 18, 37, 38, 39, 40, 13];
        if(keyCodes.indexOf(event.keyCode)< 0){
        if (val.length > 0) {
            this.collection.query = val;
            this.collection.fetch();
        } else {
            this.renderError();
        }}
    }
});