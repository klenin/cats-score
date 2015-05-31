function cats_score_init() {
    CATS.Config.proxy_path = "http://imcs.dvfu.ru/cats/main.pl?f=proxy&u=";

    CATS.App = new CATS.Controller();
    CATS.App.register_adapter(new CATS.Adapter.Cats_xml_hist(CATS.Test.cats_xml_data));
    CATS.App.register_adapter(new CATS.Adapter.Cats_rank_table(CATS.Test.cats_rank_table_json_data));
    CATS.App.register_adapter(new CATS.Adapter.Ifmo(CATS.Test.ifmo_html_data));
    CATS.App.register_adapter(new CATS.Adapter.Codeforces());
    CATS.App.register_adapter(new CATS.Adapter.Cats());
    CATS.App.register_adapter(new CATS.Adapter.MyIcpc('app/tests/myicpc.xml'));
    CATS.App.register_adapter(new CATS.Adapter.Aizu());
    CATS.App.register_adapter(new CATS.Adapter.Domjudge());
    CATS.App.register_adapter(new CATS.Adapter.Default());
    CATS.App.register_rule(new CATS.Rule.Acm());
    CATS.App.register_rule(new CATS.Rule.School());

    require(['tests/spec/test'], function () {
        jasmine.getEnv().execute();
    });
};