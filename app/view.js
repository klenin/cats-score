CATS.View = Classify({
    init: function (skin_pages) {
        this.skin_pages = skin_pages;
    },

    tpl: {
        templates: {},

        loadTemplates: function (names, callback) {
            var formated_names = [];
            $.each(names, function(k, v) {
                formated_names[k] = 'text!' + v + '.html';
            });

            var self = this;
            requirejs.config({baseUrl: 'app/skins/'});
            require(formated_names, function () {
                for (var i = 0; i < names.length; ++i) {
                    self.templates[names[i]] = arguments[i];
                    console.log("template " + names[i] + " loaded");
                }
                callback();
            });
        },

        get: function (name) {
            return this.templates[name];
        }

    },

    View_state: Backbone.Model.extend({
        defaults: {
            state: null,
            page_name: null,
            source: null,
            skin: null,
            contest_id: null,
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
            "!show_contests/:source/:skin": "show_contests",
            "!show_contest/:source/:page_name/:skin/:contestid": "show_contest"
        },

        show_contests: function (source, skin) {
            this.view_state.set({ source: source, page_name: 'contests', state: 'contests', skin: skin });
        },

        show_contest: function (source, page_name, skin, contest_id) {
            this.view_state.set({ source: source, page_name: page_name, state: 'contest', skin: skin, contest_id: contest_id });
        },

        generate_url: function() {
            switch (this.view_state.get("state")) {
                case "contest":
                    return "!show_contest/" +
                        this.view_state.get("source") + "/" +
                        this.view_state.get("page_name") + "/" +
                        this.view_state.get("skin") + "/" +
                        this.view_state.get("contest_id");
                case "contests":
                    return "!show_contests/" +
                        this.view_state.get("source") + "/" +
                        this.view_state.get("skin");
                default :
                    return null;
            }
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

        initialize: function (options) {
            $.extend(this, options);
            this.view_state.bind('change', this.refresh, this);
        },

        events: {
            'change #page_name': function () {
                this.page_name($("#page_name").val());
            },
            'change #source': function () {
                this.source($("#source").val());
            },
            'change #skin': function () {
                this.skin($("#skin").val());
            },
            'click #next_page': function () {
                var next_page = this.next_page() + this.view_state.get("elements_on_page");
                if (next_page > $("#last_elem_idx").val())
                    next_page = 0;
                this.next_page(next_page);
            }
        },

        header: function (name) {
            return _.template(this.tpl.get(name))({});
        },

        page: function(skin, page_name) {
            return _.template(this.tpl.get(skin + '/' + page_name));
        },

        define_stylesheet: function (skin) {
            $('link').detach();
            $('head').append('<link rel="stylesheet" href="app/css/' + skin + '.css" type="text/css" />');
        },

        refresh: function () {
            this["refresh_" + this.view_state.get("state")]();
        },

        refresh_contest: function() {
            var self = this;
            CATS.App.adapter_process_contest(this.source(), function (params) {
                self.render(params);
            }, this.view_state.get("contest_id"));
        },

        refresh_contests: function() {
            var self = this;
            CATS.App.adapter_process_contests(this.source(), function (params) {
                self.render(params);
            });
        },

        render: function(params){
            var page_name = this.page_name();
            var source = this.source();
            var skin = this.skin();
            this.define_stylesheet(skin);

            this.$el.html(this.header("header_" + this.view_state.get("state")) + this.page(skin, page_name)({
                app: CATS.App,
                models: params,
                source: source,
                skin: skin,
                next_page: this.next_page(),
                elem_cnt: this.view_state.get("elements_on_page")
            }));

            $("#source").val(this.source());
            $("#page_name").val(this.page_name());
            $("#skin").val(this.skin());

            return this;
        },

        page_name: function (page_name) {
            if (page_name != undefined)
                this.view_state.set({page_name: page_name})
            return this.view_state.get("page_name");
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
            this.router.navigate(current.params != null ? current.fragment : "!show_contests/codeforces/codeforces", {trigger: true});
        }
    }),

    display : function () {
        //$(document).on('click', 'a', function() {return false;});
        var tpl = this.tpl;
        var self = this;
        tpl.loadTemplates(this.skin_pages, function() {
            var view_state = new self.View_state();
            var router = new self.Router({ view_state: view_state});

            view_state.bind("change", function () {
                router.navigate(router.generate_url());
            })

            var view = new self.View_logic({
                view_state: view_state,
                router: router,
                tpl: tpl
            });

            Backbone.history.start();
            view.start();
        });
    }
})


