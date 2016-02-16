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

var app = app || {};


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