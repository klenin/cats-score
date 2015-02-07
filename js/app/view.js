CATS.View = Classify({
    display : function () {
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
                    router.navigate("!/table", true);
                    return;
                }

                if (state == "history") {
                    router.navigate("!/history", true);
                    return;
                }
            });

            var Router = Backbone.Router.extend({
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
            var router = new Router();


            var cats = CATS.App.process_adapter("cats", string_to_date("07.11.2014 18:00"));
            var ifmo = CATS.App.process_adapter("ifmo", string_to_date("07.11.2014 18:00"));

            var View = Backbone.View.extend({
                el: $("#wrapper"),

                templates: {
                    table: _.template(tpl.get('table')),
                    history: _.template(tpl.get('history'))
                },

                models: {
                    cats: cats,
                    ifmo: ifmo
                },

                refresh: function() {
                    var self = this;;

                    self.render();
                    $("#source").val(self.source());
                    $("#state").val(self.state());
                },

                initialize: function () {
                    this.model.bind('change', this.refresh, this);
                },

                events: {
                    'change #state': function () {
                        this.state($("#state").val());
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
                    this.$el.html(this.header() + this.templates[state]({app: CATS.App, models: this.models[source]}));
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
                    router.navigate("!/table", true);
                }
            });
            var view;

            if (view == undefined) {
                view = new View({ model: viewState });
                Backbone.history.start();
                view.start();
            }
        });
    }
})


