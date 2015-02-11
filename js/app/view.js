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
            'ifmo/table', 'ifmo/history',
            'codeforces/table', 'codeforces/history',
        ], function() {
            var ViewState = Backbone.Model.extend({
                defaults: {
                    state: "",
                    source: "ifmo",
                    skin: "ifmo",
                    next_page: 0,
                    elements_on_page: 20
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


            var cats = CATS.App.process_adapter("cats", CATS.Test.cats_xml_data);
            var ifmo = CATS.App.process_adapter("ifmo", CATS.Test.ifmo_html_data);

            var View = Backbone.View.extend({
                el: $("#wrapper"),

                models: {
                    cats: cats,
                    ifmo: ifmo,
                    codeforces: null//codeforces
                },

                refresh: function() {
                    var self = this;;

                    self.render();
                    $("#source").val(self.source());
                    $("#source").trigger("change");
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
                        if ($("#source").val() != "codeforces")
                            this.source($("#source").val());
                    },
                    'change #cf_contest': function () {
                        var self = this;
                        var contest_id = $("#cf_contest").val();
                        get_jsonp(
                            "http://codeforces.ru/api/contest.standings?contestId=" +
                            contest_id +
                            "&from=1&count=10000000&showUnofficial=true",
                            function( data ) {
                                self.models.codeforces = CATS.App.process_adapter("codeforces", data.result);
                                self.source("codeforces");
                                CATS.App.last_contest_id = contest_id;
                                self.refresh();
                            });
                    },
                    'change #skin': function () {
                        this.skin($("#skin").val());
                    },
                    'click #next_page': function () {
                        var next_page = this.next_page() + this.model.get("elements_on_page");
                        if (next_page > $("#last_elem_idx").val())
                            next_page = 0
                        this.next_page(next_page);
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
                    $('head').append('<link rel="stylesheet" href="css/' + skin + '.css?iu=34545" type="text/css" />');
                },

                render: function(){
                    var state = this.state();
                    var source = this.source();
                    var skin = this.skin();
                    this.define_stylesheet(skin);
                    this.$el.html(this.header() + this.page(skin, state)({
                        app: CATS.App,
                        models: this.models[source],
                        next_page: this.next_page(),
                        elem_cnt: this.model.get("elements_on_page")
                    }));
                    return this;
                },

                state: function (state) {
                    if (state != undefined)
                        this.model.set({state: state})
                    return this.model.get("state");
                },

                next_page: function (next_page) {
                    if (next_page != undefined)
                        this.model.set({next_page: next_page})
                    return this.model.get("next_page");
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


