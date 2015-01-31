(function($){
$(document).on('click', 'a', function() {return false;});
tpl.loadTemplates(['header', 'table', 'history'], function() {
    var AppState = Backbone.Model.extend({
        defaults: {
            state: "",
            source: "cats"
        },
        name: "AppState",
    });
    var appState = new AppState();

    appState.bind("change:state", function () {
        var state = this.get("state");

        if (state == "table") {
            controller.navigate("!/table", true);
            return;
        }

        if (state == "history") {
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

    var cats_contest_info = new Contest_info_model(string_to_date("07.11.2014 18:00"), ["Second Best", "Customer support"]);
    var cats_contest = new Contest_model();
    cats_contest.contest_info = cats_contest_info;
    var cats = new Cats_adapter(cats_xml_data_for_test, cats_contest);

    var ifmo_contest = new Contest_model();
    var ifmo = new Ifmo_adapter(ifmo_html_data_for_test, ifmo_contest);

    var App = Backbone.View.extend({
        el: $("#wrapper"),

        templates: {
            table: _.template(tpl.get('table')),
            history: _.template(tpl.get('history'))
        },

        contest_models: {
            cats: null,
            ifmo: null
        },

        adapters: {
            ifmo: ifmo,
            cats: cats
        },

        refresh: function() {
            var self = this;
            self.contest_models[self.source()] = self.adapters[self.source()].parse();

            self.render();
            $("#source").val(self.source());
        },

        initialize: function () { 
            this.model.bind('change', this.refresh, this);
        },

        events: {
            'click a#look_history': function () {
                controller.navigate("!/history", true);
            },
            'click a#look_table': function () {
                controller.navigate("!/table", true);
            },
            'change #source': function () {
                this.source($("#source").val());
            }
        },

        header: function () {
            return _.template(tpl.get('header'))({});
        },

        render: function(){
            var state = this.state();
            var source = this.source();
            this.$el.html(this.header() + this.templates[state]({model: this.contest_models[source]}));
            return this;
        },

        state: function (state) {
            if (state != undefined)
                this.model.set({state: state})
            return this.model.get("state");
        },

        source: function (source) {
            if (source != undefined)
                this.model.set({source: source})
            return this.model.get("source");
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
