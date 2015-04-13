CATS.View = Classify({
    init: function (templates, css_base_url) {
        this.templates = templates;
        this.css_base_url = css_base_url;
    },

    View_state: Backbone.Model.extend({
        defaults: {
            state: null,
            page_name: null,
            source: null,
            skin: null,
            contest_id: null,
            lang: null,
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
            "!show_contests_list/:source/:skin": "show_contests_list",
            "!show_contests_list/:source/:skin/:lang": "show_contests_list_with_lang",
            "!show_rank_table/:source/:page_name/:skin/:contestid": "show_rank_table",
            "!show_rank_table/:source/:page_name/:skin/:contestid/:lang": "show_rank_table_with_lang"
        },

        show_contests_list: function (source, skin) {
            this.view_state.set({ source: source, page_name: 'contests', state: 'contests_list', skin: skin });
        },

        show_contests_list_with_lang: function (source, skin, lang) {
            this.view_state.set({ source: source, page_name: 'contests', state: 'contests_list', skin: skin, lang: lang });
        },

        show_rank_table: function (source, page_name, skin, contest_id) {
            this.view_state.set({ source: source, page_name: page_name, state: 'rank_table', skin: skin, contest_id: contest_id });
        },

        show_rank_table_with_lang: function (source, page_name, skin, contest_id, lang) {
            this.view_state.set({ source: source, page_name: page_name, state: 'rank_table', skin: skin, contest_id: contest_id, lang: lang });
        },

        generate_url: function() {
            switch (this.view_state.get("state")) {
                case "rank_table":
                    return "!show_rank_table/" +
                        this.view_state.get("source") + "/" +
                        this.view_state.get("page_name") + "/" +
                        this.view_state.get("skin") + "/" +
                        this.view_state.get("contest_id") +
                        (this.view_state.get("lang") != null ? "/" + this.view_state.get("lang") : "");
                case "contests_list":
                    return "!show_contests_list/" +
                        this.view_state.get("source") + "/" +
                        this.view_state.get("skin") +
                        (this.view_state.get("lang") != null ? "/" + this.view_state.get("lang") : "");
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
            return _.template(this.get_template(name))({});
        },

        page: function(skin, page_name) {
            return _.template(this.get_template(skin + '/' + page_name));
        },

        define_stylesheet: function (skin) {
            $('link#cats_score').detach();
            $('head').append('<link id="cats_score" rel="stylesheet" href="'  + this.css_base_url + '/' + skin + '/style.css" type="text/css" />');
        },

        refresh: function () {
            this["refresh_" + this.view_state.get("state")]();
        },

        refresh_rank_table: function() {
            var self = this;
            CATS.App.adapter_process_rank_table(this.source(), function (params) {
                self.render(params);
            }, this.view_state.get("contest_id"));
        },

        refresh_contests_list: function() {
            var self = this;
            CATS.App.adapter_process_contests_list(this.source(), function (params) {
                self.render(params);
            });
        },

        render: function(params){
            var page_name = this.page_name();
            var source = this.source();
            var skin = this.skin();

            if (this.with_css)
                this.define_stylesheet(skin);

            var scoring = "acm";
            for (var i = 0; i < params.contests.length; ++i) {
                if (CATS.App.contests[params.contests[i]].scoring == "school") //суммируются турниры разных правил, выбирем школьные
                    scoring = "school";
            }
            if (page_name == "table")
                page_name += "_" + scoring;

            var header = this.with_header ? this.header("header_" + this.view_state.get("state")) : "";
            this.$el.html(header + this.page(skin, page_name)({
                app: CATS.App,
                models: params,
                source: source,
                skin: skin,
                lang: this.view_state.get("lang") != null ? this.view_state.get("lang") : "ru",
                next_page: this.with_pagination ? this.next_page() : 0,
                elem_cnt:  this.with_pagination ? this.view_state.get("elements_on_page") : CATS.App.result_tables[params.table].score_board.length
            }));

            $("#source").val(this.source());
            $("#page_name").val(this.page_name());
            $("#skin").val(this.skin());

            return this;
        },

        get_template : function (name) {
            return this.templates[name];
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
            var default_url = this.default_url_hash ? this.default_url_hash : "!show_contests_list/codeforces/codeforces";
            this.router.navigate(current.params != null ? current.fragment : default_url, {trigger: true});
        }
    }),

    display : function (defaults) {
        //$(document).on('click', 'a', function() {return false;});
        var templates = this.templates;
        var self = this;

        var view_state = new self.View_state();
        var router = new self.Router({ view_state: view_state});

        view_state.bind("change", function () {
            router.navigate(router.generate_url());
        })

        var view = new self.View_logic($.extend({
            view_state: view_state,
            router: router,
            templates: templates,
            css_base_url: self.css_base_url
        }, defaults));

        Backbone.history.start();
        view.start();
    }
})


