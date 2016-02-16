/*****************TRACKED FOOD ITEMS********************/
/*FoodItemView - Backbone View
 View for each table row displayed for 'added' food items.
 View uses two templates, one for standard display and one for editing
 qty of tracked food items.
 - [click .remove] is triggered when user presses 'x' button,
 calls function [remove] which destroys the model.
 - [click .edit] is triggered when user press 'pencil' button,
 calls [edit] function which sets model's value of 'edit' to 'yes'.
 This will trigger model change and assign different template during rendering.
 - [click .update] is triggered when user is done with editing qty,
 calls [update] function, which reads input with qty, gets model's weight and calories,
 multiply them by input qty and sets new values for all three. And changes 'edit' value to 'no'.
 - [keyup .inputqty] checks if user wanted to confirm change with enter key instead on screen button.
 Then calls [update] function.
 - [render] checks if 'edit' value is 'yes' and then uses the matching template.*/


var app = app || {};

app.FoodItemView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($('#food_list_template').html()),
    templateEdit: _.template($('#food_list_template_update').html()),
    events: {
        'click .remove': 'remove',
        'click .edit': 'edit',
        'click .update': 'update',
        'keyup .inputqty': "enter"
    },
    initialize: function () {
        this.model.on('change', this.render, this);
        this.model.on('remove', this.render, this);
    },
    render: function () {
        var foodItem = this.model.toJSON();
        var temp;
        if (this.model.get('edit') === "yes") {
            temp = this.templateEdit;
        } else {
            temp = this.template;
        }
        this.$el.html(temp(foodItem));
        return this;
    },
    remove: function () {
        this.model.destroy();
    },
    edit: function () {
        this.model.set('edit', 'yes');
    },
    update: function () {
        var qty = this.$('.inputqty').val();
        var weight = this.model.get('weight') * qty;
        var calories = this.model.get('calories') * qty;
        this.model.set({
            weight: weight,
            calories: calories,
            qty: qty,
            edit: 'no'
        });
    },
    enter: function (event) {
        if (event.keyCode === 13) {
            this.update();
        }
    }
});
