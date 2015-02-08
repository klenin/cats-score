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

        tpl.loadTemplates(['header',
            'default/table', 'default/history',
            'ifmo/table', 'ifmo/history'
        ], function() {
            var ViewState = Backbone.Model.extend({
                defaults: {
                    state: "",
                    source: "ifmo",
                    skin: "ifmo"
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

                models: {
                    cats: cats,
                    ifmo: ifmo
                },

                refresh: function() {
                    var self = this;;

                    self.render();
                    $("#source").val(self.source());
                    $("#state").val(self.state());
                    $("#skin").val(self.skin());
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
                    },
                    'change #skin': function () {
                        this.skin($("#skin").val());
                    }
                },

                header: function () {
                    return _.template(tpl.get('header'))({});
                },

                page: function(skin, state) {
                    return _.template(tpl.get(skin + '/' + state));
                },

                define_stylesheet : function (skin) {
                    $('link').detach();
                    $('head').append('<link rel="stylesheet" href="css/' + skin + '.css?" type="text/css" />');
                },

                render: function(){
                    var state = this.state();
                    var source = this.source();
                    var skin = this.skin();
                    this.define_stylesheet(skin);
                    this.$el.html(this.header() + this.page(skin, state)({app: CATS.App, models: this.models[source]}));
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

                skin: function (skin) {
                    if (skin != undefined)
                        this.model.set({skin: skin})
                    return this.model.get("skin");
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


