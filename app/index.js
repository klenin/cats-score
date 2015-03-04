requirejs.config({
    baseUrl: 'app/',
    paths: {
        jquery: "//yandex.st/jquery/2.0.3/jquery.min",
        underscore: "//yandex.st/underscore/1.5.2/underscore-min",
        backbone: "//yandex.st/backbone/1.0.0/backbone-min",
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

                        var view = new CATS.View([
                            'header_rank_table', 'header_contests_list',
                            'default/table_acm', 'default/table_school', 'default/history', 'default/contests',
                            'ifmo/table_acm', 'ifmo/table_school', 'ifmo/history', 'ifmo/contests',
                            'codeforces/table_acm', 'codeforces/table_school', 'codeforces/history', 'codeforces/contests',
                        ]);

                        //argument is optional
                        view.display({
                            with_header: true,
                            default_url_hash: "!show_contests_list/codeforces/codeforces"
                        });
                    });
                });
            });
        });
    });
});


