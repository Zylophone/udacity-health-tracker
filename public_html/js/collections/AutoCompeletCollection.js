/*****************AUTO COMPLETE*********************/
/*AutoCompeletCollection - Bacbone Collection. 
 Default [sync] is overwritten to get information from the server.
 - appID and appKey is stored in object [nutritionix]
 - url is returned in function together with user's query
 [parse] function will process the response.
 - if return is empty it will trigger error, which will be handled in app.AutoCompeletListView.
 - else it will reset collection to create list of suggestions.*/

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
                    text: item.text
                };
            });
            this.reset(searchCollection);
        }
    }
});
