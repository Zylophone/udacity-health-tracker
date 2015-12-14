/*****************AUTO COMPLETE*********************/
/*Bacbone View for each model, uses simple template to paste autocomplete text*/

app.AutoCompeletItemView = Backbone.View.extend({
    template: _.template('<option value="<%= text %>">'),
    render: function () {
        var foodItem = this.model.toJSON();
        this.$el.html(this.template(foodItem));
        return this;
    }
});