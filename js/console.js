$("document").ready(function(){
    //extendGetScriptFunction('js/app/');
    //$.getScript([
    requirejs.config({baseUrl: 'js/app/'});
    require(['controller'], function () {
        require([
            'tests/cats_xml_data',
            'tests/ifmo_html_data',
            'models/version',
            'models/entity',
            'models/event',
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
            CATS.App.regist_adapter(new CATS.Adapter.Cats(CATS.Test.cats_xml_data));
            CATS.App.regist_adapter(new CATS.Adapter.Ifmo(CATS.Test.ifmo_html_data));
            CATS.App.regist_rule(new CATS.Rule.Acm());

            jasmine.getEnv().execute();
        });
    });
});
