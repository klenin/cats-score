(function($){
    //extendGetScriptFunction('js/app/');
    require([
        'js/app/controller.js',
        'js/app/tests/cats_xml_data.js',
        'js/app/tests/ifmo_html_data.js',
        'js/app/models/version.js',
        'js/app/models/entity.js',
        'js/app/models/event.js',
        'js/app/models/chat.js',
        'js/app/models/compiler.js',
        'js/app/models/contest.js',
        'js/app/models/prize.js',
        'js/app/models/problem.js',
        'js/app/models/run.js',
        'js/app/models/results_table.js',
        'js/app/models/user.js',
        'js/app/rules/acm.js',
        'js/app/adapters/cats.js',
        'js/app/adapters/ifmo.js',
        'js/app/adapters/codeforces.js',
        'js/app/view.js'
    ], function()
    {
        CATS.App = new CATS.Controller();
        CATS.App.regist_adapter(new CATS.Adapter.Cats(-1, CATS.Test.cats_xml_data));
        CATS.App.regist_adapter(new CATS.Adapter.Ifmo(-1, CATS.Test.ifmo_html_data));
        CATS.App.regist_adapter(new CATS.Adapter.Codeforces());
        CATS.App.regist_rule(new CATS.Rule.Acm());

        var view = new CATS.View([
            'header_contest', 'header_contests',
            'default/table', 'default/history', 'default/contests',
            'ifmo/table', 'ifmo/history', 'ifmo/contests',
            'codeforces/table', 'codeforces/history', 'codeforces/contests',
        ]);

        view.display();
    });
})(jQuery);

