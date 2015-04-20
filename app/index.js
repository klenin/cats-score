function cats_score_init() {
    CATS.Config.proxy_path = "/cats/score/";

    CATS.App = new CATS.Controller();
    CATS.App.register_adapter(new CATS.Adapter.Cats_xml_hist([-1], CATS.Test.cats_xml_data));
    CATS.App.register_adapter(new CATS.Adapter.Cats_rank_table([-1], CATS.Test.cats_rank_table_json_data));
    CATS.App.register_adapter(new CATS.Adapter.Ifmo([-1], CATS.Test.ifmo_html_data));
    CATS.App.register_adapter(new CATS.Adapter.Codeforces([-1]));
    CATS.App.register_adapter(new CATS.Adapter.Default([-1]));
    CATS.App.register_rule(new CATS.Rule.Acm());
    CATS.App.register_rule(new CATS.Rule.School());
    CATS.App.utils = new CATS.Utils();

    var skins_names = [
        'header_rank_table', 'header_contests_list', 'pagination', 'footer',
        'default/table_acm', 'default/table_school', 'default/history', 'default/contests',
        'ifmo/table_acm', 'ifmo/table_school', 'ifmo/history', 'ifmo/contests',
        'codeforces/table_acm', 'codeforces/table_school', 'codeforces/history', 'codeforces/contests',
        'cats/table_acm', 'cats/table_school', 'cats/history', 'cats/contests',
        'opencup/table_acm', 'opencup/table_school', 'opencup/history', 'opencup/contests',
    ];
    var templates_names = [], templates =[];

    for (var i = 0; i < skins_names.length; ++i) {
        templates[skins_names[i]] = arguments[i];
        console.log("template " + skins_names[i] + " loaded");
    }

    var view = new CATS.View(templates, 'app/skins');

    //argument is optional
    view.display({
        with_header: true,
        with_footer: true,
        with_pagination: true,
        with_css: true,
        default_url_hash: "!show_contests_list/codeforces/codeforces"
    });
}