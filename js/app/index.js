(function($){
    var getScript = jQuery.getScript;
    
    var thisPath = 'js/app/'
    
    jQuery.getScript = function( resources, callback ) {
        var // reference declaration &amp; localization
            length = resources.length,
            handler = function() { counter++; },
            deferreds = [],
            counter = 0,
            idx = 0;

        for ( ; idx < length; idx++ ) {
            deferreds.push(
                getScript(thisPath + resources[ idx ], handler )
            );
        }

        jQuery.when.apply( null, deferreds ).then(function() {
            callback && callback();
        });
    };

    $.getScript([
        'controller.js',
        'models/version.js',
        'models/entity.js',
        'models/event.js',
        'models/chat.js',
        'models/compiler.js',
        'models/contest.js',
        'models/prize.js',
        'models/problem.js',
        'models/run.js',
        'models/table.js',
        'models/user.js',
        'rules/acm.js',
        'adapters/cats.js',
        'adapters/ifmo.js',
        'view.js'
    ], function()
    {
        CATS.App = new CATS.Controller();
        CATS.App.regist_adapter(new CATS.Adapter.Cats());
        CATS.App.regist_adapter(new CATS.Adapter.Ifmo());
        CATS.App.regist_rule(new CATS.Rule.Acm());
    });
})(jQuery);

