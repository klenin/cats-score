(function($){
    //extendGetScriptFunction('js/app/');
    //$.getScript([
    requirejs.config({baseUrl: 'js/app/'});
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
                    'adapters/codeforces',
                    'view'
                ], function () {
                    CATS.App = new CATS.Controller();
                    CATS.App.register_adapter(new CATS.Adapter.Cats(-1, CATS.Test.cats_xml_data));
                    CATS.App.register_adapter(new CATS.Adapter.Ifmo(-1, CATS.Test.ifmo_html_data));
                    CATS.App.register_adapter(new CATS.Adapter.Codeforces());
                    CATS.App.register_rule(new CATS.Rule.Acm());

                    var view = new CATS.View([
                        'header_contest', 'header_contests',
                        'default/table', 'default/history', 'default/contests',
                        'ifmo/table', 'ifmo/history', 'ifmo/contests',
                        'codeforces/table', 'codeforces/history', 'codeforces/contests',
                    ]);

                    view.display();
                });
            });
        });
    });
})(jQuery);

