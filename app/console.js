$("document").ready(function(){
    //extendGetScriptFunction('js/app/');
    //$.getScript([
    requirejs.config({baseUrl: 'app/'});
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
                    CATS.App.register_adapter(new CATS.Adapter.Cats(CATS.Test.cats_xml_data));
                    CATS.App.register_adapter(new CATS.Adapter.Ifmo(CATS.Test.ifmo_html_data));
                    CATS.App.register_rule(new CATS.Rule.Acm());

                    jasmine.getEnv().execute();
                });
            });
        });
    });
});
