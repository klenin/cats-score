(function($){
$(document).on('click', 'a', function() {return false;});
tpl.loadTemplates(['table', 'history'], function() {
    var AppState = Backbone.Model.extend({
        defaults: {
            state: "",
        },
        name: "AppState",
    });
    var appState = new AppState();

    appState.bind("change:state", function () { // подписка на смену состояния для контроллера
        var state = this.get("state");

        if (state == "table") { //незалогинился
            controller.navigate("!/table", true);
            return;
        }

        if (state == "history") { //незалогинился
            controller.navigate("!/history", true);
            return;
        }
    });

    var Controller = Backbone.Router.extend({
        routes: {
            "!/table": "table",
            "!/history": "history"
        },

        table: function () {
            appState.set({ state: "table" });
        },

        history: function () {
            appState.set({ state: "history" });
        }

    });
    var controller = new Controller();

    var table = new Table_model();
    var history = new History_model(string_to_date("07.11.2014 18:33"), ["Second Best", "Customer support"]);
    var cats = new Cats_adapter(cats_xml_data_for_test, history);
    var ifmo = new Ifmo_adapter(ifmo_html_data_for_test, table);

    var App = Backbone.View.extend({
        el: $("#wrapper"),

        templates: { // Шаблоны на разное состояние
            table: _.template(tpl.get('table')),
            history: _.template(tpl.get('history'))
        },


        models: {
            table: table,
            history: history
        },

        adapters: {
            table: ifmo,
            history: cats
        },

        refresh: function() {
            var self = this;
            $.each(self.models, function(index, model) {
                self.models[index] = self.adapters[index].get_model();
            });
            self.render();
        },

        initialize: function () { // Подписка на событие модели
            this.model.bind('change', this.refresh, this);
        },

        events: {
            'click a#look_history': function () {
                controller.navigate("!/history", true);
            },
            'click a#look_table': function () {
                controller.navigate("!/table", true);
            }
        },

        render: function(){
            var state = this.state();
            this.$el.html(this.templates[state]({model: this.models[state]}));
            return this;
        },

        state: function (state) {
            if (state != undefined)
                this.model.set({state: state})
            return this.model.get("state");
        },

        start: function () {
            controller.navigate("!/table", true);
        }
    });
    var app;

    if (app == undefined) {
        app = new App({ model: appState });
        Backbone.history.start();
        app.start();
    }

});})(jQuery);
