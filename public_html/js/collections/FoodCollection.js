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
