
requirejs.config({
    baseUrl: 'app/',
    paths: {
        jquery: "//yandex.st/jquery/2.0.3/jquery.min",
        classify: "../vendors/classify.min",
        dateformat: "../vendors/date.format",
        utils: "../app/utils"
    }
});
require(['jquery'], function () {
    require(['classify', 'dateformat', 'utils'], function () {
        require(['controller'], function () {
            require(['models/entity'], function () {
                require(['models/event'], function () {
                    require([
                        'tests/cats_xml_data',
                        'tests/ifmo_html_data',
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
                        'adapters/cats',
                        'adapters/ifmo',
                        'tests/spec/test'
                    ], function () {
                        CATS.App = new CATS.Controller();
                        CATS.App.register_adapter(new CATS.Adapter.Cats([-1], CATS.Test.cats_xml_data));
                        CATS.App.register_adapter(new CATS.Adapter.Ifmo([-1], CATS.Test.ifmo_html_data));
                        CATS.App.register_rule(new CATS.Rule.Acm());

                        jasmine.getEnv().execute();
                    });
                });
            });
        });
    });
});