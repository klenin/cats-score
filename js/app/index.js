(function($){
    extendGetScriptFunction('js/app/');
    $.getScript([
        'controller.js',
        'tests/cats_xml_data.js',
        'tests/ifmo_html_data.js',
        'models/version.js',
        'models/entity.js',
        'models/event.js',
        'models/chat.js',
        'models/compiler.js',
        'models/contest.js',
        'models/prize.js',
        'models/problem.js',
        'models/run.js',
        'models/results_table.js',
        'models/user.js',
        'rules/acm.js',
        'adapters/cats.js',
        'adapters/ifmo.js',
        'adapters/codeforces.js',
        'view.js'
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

