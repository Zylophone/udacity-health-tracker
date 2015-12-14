/****************ROUTER Backbone*********************/
/*Simple router which keep tracks of selected dates.
 Once user go back (or forward) it set date of picker to date from url*/

app.Router = Backbone.Router.extend({
    'routes': {
        '': 'index',
        'index.html': 'index',
        'date/:id': 'show'
    },
    index: function () {
        app.picker.setDate(app.loadDay);
    },
    show: function (id) {
        app.picker.setDate((moment(id, 'YYYYMMDD').format('YYYY-MMM-DD')));
    }
});

