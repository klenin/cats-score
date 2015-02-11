(function($){
    extendGetScriptFunction();
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
        CATS.App.regist_adapter(new CATS.Adapter.Cats(CATS.Test.cats_xml_data));
        CATS.App.regist_adapter(new CATS.Adapter.Ifmo(CATS.Test.ifmo_html_data));
        CATS.App.regist_adapter(new CATS.Adapter.Codeforces(153));
        CATS.App.regist_rule(new CATS.Rule.Acm());
        var view = new CATS.View()
        view.display();
    });
})(jQuery);

