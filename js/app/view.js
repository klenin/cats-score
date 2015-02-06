$(document).on('click', 'a', function() {return false;});

tpl = {
    templates: {},

    loadTemplates: function (names, callback) {

        var that = this;

        var loadTemplate = function (index) {
            var name = names[index];
            console.log('Loading template: ' + name);
            $.get('skins/' + name + '.html', function (data) {
                that.templates[name] = data;
                index++;
                if (index < names.length) {
                    loadTemplate(index);
                } else {
                    callback();
                }
            })
        }

        loadTemplate(0);
    },

    get: function (name) {
        return this.templates[name];
    }

};

tpl.loadTemplates(['header', 'table', 'history'], function() {
    var ViewState = Backbone.Model.extend({
        defaults: {
            state: "",
            source: "cats"
        },
        name: "ViewState",
    });
    var viewState = new ViewState();

    viewState.bind("change:state", function () {
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
            viewState.set({ state: "table" });
        },

        history: function () {
            viewState.set({ state: "history" });
        }

    });
    var controller = new Controller();

    var cats_contest = CATS.Model.Contest();
    var a = CATS.Adapter.Cats(cats_xml_data_for_test, cats_contest);
    cats_contest.start_time = string_to_date("07.11.2014 18:00");
    a.parse();
    CATS.App.add_object(cats_contest);


    //var ifmo_contest = new Contest_model();
   // var ifmo = new Ifmo_adapter(ifmo_html_data_for_test, ifmo_contest);

    var View = Backbone.View.extend({
        el: $("#wrapper"),

        templates: {
            table: _.template(tpl.get('table')),
            history: _.template(tpl.get('history'))
        },

       // contest_models: {
       //     cats: null,
       //     ifmo: null
       // },

     //   adapters: {
     //       ifmo: ifmo,
     //       cats: cats
     //   },

        refresh: function() {
            var self = this;
           // self.contest_models[self.source()] = self.adapters[self.source()].parse();

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
            debugger;
            this.$el.html(this.header() + this.templates[state]({app: CATS.App, contest_id: cats_contest.id}));//this.contest_models[source]}));
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
            controller.navigate("!/history", true);
        }
    });
    var view;

    if (view == undefined) {
        view = new View({ model: viewState });
        Backbone.history.start();
        view.start();
    }

});
