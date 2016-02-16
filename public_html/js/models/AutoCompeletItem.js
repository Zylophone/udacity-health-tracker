/*****************AUTO COMPLETE*********************/
/*Auto Complete uses Nutritionix API Autocomplete
 [https://developer.nutritionix.com/docs/v2/autocomplete].
 It will display datalist suggestions under the search input, once user will start typing.
 */

/*AutoCompeletItem is Backbone Model for storing text*/

var app = app || {};

app.AutoCompeletItem = Backbone.Model.extend({
    defaults: {
        text: ''
    }
});