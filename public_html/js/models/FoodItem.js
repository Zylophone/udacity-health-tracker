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