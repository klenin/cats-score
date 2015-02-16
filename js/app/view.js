CATS.View = Classify({
    init: function (skin_pages, models) {
        this.skin_pages = skin_pages;
        this.models = models;
    },

    tpl: {
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

    },

    View_state: Backbone.Model.extend({
        defaults: {
            state: "",
            source: "",
            skin: "",
            next_page: 0,
            elements_on_page: 20
        },
        name: "ViewState",
    }),

    Router: Backbone.Router.extend({

        initialize: function (options) {
            $.extend(this, options);
        },

        routes: {
            "!show/:source/:state/:skin": "show"
        },

        show: function (source, state, skin) {
            this.view_state.set({ source: source, state: state, skin: skin });
        },

        current : function() {
            var Router = this,
                fragment = Backbone.history.fragment,
                routes = _.pairs(Router.routes),
                route = null, params = null, matched;

            matched = _.find(routes, function(handler) {
                route = _.isRegExp(handler[0]) ? handler[0] : Router._routeToRegExp(handler[0]);
                return route.test(fragment);
            });

            if(matched) {
                // NEW: Extracts the params using the internal
                // function _extractParameters
                params = Router._extractParameters(route, fragment);
                route = matched[1];
            }

            return {
                route : route,
                fragment : fragment,
                params : params
            };
        }
    }),

    View_logic: Backbone.View.extend({
        el: $("#wrapper"),

        refresh: function() {
            this.render();
            $("#source").val(this.source());
            $("#source").trigger("change");
            $("#state").val(this.state());
            $("#skin").val(this.skin());
        },

        initialize: function (options) {
            $.extend(this, options);
            this.view_state.bind('change', this.refresh, this);
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
                var next_page = this.next_page() + this.view_state.get("elements_on_page");
                if (next_page > $("#last_elem_idx").val())
                    next_page = 0
                this.next_page(next_page);
            }
        },

        header: function () {
            return _.template(this.tpl.get('header'))({});
        },

        page: function(skin, state) {
            return _.template(this.tpl.get(skin + '/' + state));
        },

        define_stylesheet: function (skin) {
            $('link').detach();
            $('head').append('<link rel="stylesheet" href="css/' + skin + '.css" type="text/css" />');
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
                elem_cnt: this.view_state.get("elements_on_page")
            }));
            return this;
        },

        state: function (state) {
            if (state != undefined)
                this.view_state.set({state: state})
            return this.view_state.get("state");
        },

        next_page: function (next_page) {
            if (next_page != undefined)
                this.view_state.set({next_page: next_page})
            return this.view_state.get("next_page");
        },

        source: function (source) {
            if (source != undefined)
                this.view_state.set({source: source})
            return this.view_state.get("source");
        },

        skin: function (skin) {
            if (skin != undefined)
                this.view_state.set({skin: skin})
            return this.view_state.get("skin");
        },

        start: function () {
            var current = this.router.current();
            this.router.navigate(current.params != null ? current.fragment : "!show/ifmo/table/ifmo", {trigger: true});
        }
    }),

    display : function () {
        $(document).on('click', 'a', function() {return false;});
        var tpl = this.tpl;
        var self = this;
        tpl.loadTemplates(this.skin_pages, function() {
            var view_state = new self.View_state();
            var router = new self.Router({ view_state: view_state});

            view_state.bind("change", function () {
                router.navigate("!show/" + this.get("source") + "/" + this.get("state") + "/" + this.get("skin"), true);
            })
            
            var view = new self.View_logic({ view_state: view_state, router: router, tpl: tpl, models: self.models });
            Backbone.history.start();
            view.start();
        });
    }
})


