requirejs.config({
    baseUrl: 'app/',
    paths: {
        jquery: "../vendors/jquery.min",
        underscore: "../vendors/underscore.min",
        backbone: "../vendors/backbone.min",
        classify: "../vendors/classify.min",
        dateformat: "../vendors/date.format",
        utils: "../app/utils"
    }
});
require(['jquery'], function () {
    require(['underscore', 'backbone', 'classify', 'dateformat', 'utils'], function () {
        require(['controller'], function () {
            require(['models/entity'], function () {
                require(['models/event'], function () {
                    require([
                        'tests/cats_xml_data',
                        'tests/ifmo_html_data',
                        'tests/cats_rank_table_json_data',
                        'models/version',
                        'models/chat',
                        'models/compiler',
                        'models/contest',
                        'models/prize',
                        'models/problem',
                        'models/run',
                        'models/results_table',
                        'models/user',
                        'rules/acm',
                        'rules/school',
                        'adapters/cats',
                        'adapters/cats_rank_table',
                        'adapters/ifmo',
                        'adapters/codeforces',
                        'adapters/default',
                        'view'
                    ], function () {
                        CATS.App = new CATS.Controller();
                        CATS.App.register_adapter(new CATS.Adapter.Cats([-1], CATS.Test.cats_xml_data));
                        CATS.App.register_adapter(new CATS.Adapter.Cats_rank_table([-1], CATS.Test.cats_rank_table_json_data));
                        CATS.App.register_adapter(new CATS.Adapter.Ifmo([-1], CATS.Test.ifmo_html_data));
                        CATS.App.register_adapter(new CATS.Adapter.Codeforces([-1]));
                        CATS.App.register_adapter(new CATS.Adapter.Default([-1]));
                        CATS.App.register_rule(new CATS.Rule.Acm());
                        CATS.App.register_rule(new CATS.Rule.School());


                        var skins_names = [
                            'header_rank_table', 'header_contests_list',
                            'default/table_acm', 'default/table_school', 'default/history', 'default/contests',
                            'ifmo/table_acm', 'ifmo/table_school', 'ifmo/history', 'ifmo/contests',
                            'codeforces/table_acm', 'codeforces/table_school', 'codeforces/history', 'codeforces/contests',
                            'cats/table_acm', 'cats/table_school', 'cats/history', 'cats/contests',
                        ];
                        var templates_names = [], templates =[];

                        require([//we cant use skins_names array because optimization module works only with hardcoded array constant. Proof http://requirejs.org/docs/optimization.html
                            'text!skins/header_rank_table.html', 'text!skins/header_contests_list.html',
                            'text!skins/default/table_acm.html', 'text!skins/default/table_school.html', 'text!skins/default/history.html', 'text!skins/default/contests.html',
                            'text!skins/ifmo/table_acm.html', 'text!skins/ifmo/table_school.html', 'text!skins/ifmo/history.html', 'text!skins/ifmo/contests.html',
                            'text!skins/codeforces/table_acm.html', 'text!skins/codeforces/table_school.html', 'text!skins/codeforces/history.html', 'text!skins/codeforces/contests.html',
                            'text!skins/cats/table_acm.html', 'text!skins/cats/table_school.html', 'text!skins/cats/history.html', 'text!skins/cats/contests.html',
                        ], function () {
                            for (var i = 0; i < skins_names.length; ++i) {
                                templates[skins_names[i]] = arguments[i];
                                console.log("template " + skins_names[i] + " loaded");
                            }

                            var view = new CATS.View(templates, 'app/skins');

                            //argument is optional
                            view.display({
                                with_header: true,
                                with_pagination: true,
                                default_url_hash: "!show_contests_list/codeforces/codeforces"
                            });
                        });

                    });
                });
            });
        });
    });
});


