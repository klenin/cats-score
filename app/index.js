function cats_score_init(
    rt_header,
    cl_header,
    pg,
    footer,
    charts,
    charts_p,
    charts_b,
    tbl_set,
    cnt_set,
    charts_set,
    d_tbl_acm,
    d_tbl_sch,
    d_hist,
    d_contests,
    ifmo_tbl_acm,
    ifmo_tbl_sch,
    ifmo_hist,
    ifmo_contests,
    cf_tbl_acm,
    cf_tbl_sch,
    cf_hist,
    cf_contests,
    cats_tbl_acm,
    cats_tbl_sch,
    cats_hist,
    cats_contests,
    oc_tbl_acm,
    oc_tbl_sch,
    oc_hist,
    oc_contests,
    my_tbl_acm,
    my_tbl_sch,
    my_hist,
    my_contests,
    dj_tbl_acm,
    dj_tbl_sch,
    dj_hist,
    dj_contests,
    ka_tbl_acm,
    ka_tbl_sch,
    ka_hist,
    ka_contests,
    ur_tbl_acm,
    az_tbl_acm,
    ioi_tbl_sch
) {
    CATS.Config.proxy_path = "http://imcs.dvfu.ru/cats/main.pl?f=proxy&u=";

    CATS.App = new CATS.Controller();
    CATS.App.register_adapter(new CATS.Adapter.Cats_xml_hist(CATS.Test.cats_xml_data));
    CATS.App.register_adapter(new CATS.Adapter.Cats_rank_table(CATS.Test.cats_rank_table_json_data));
    CATS.App.register_adapter(new CATS.Adapter.Ifmo(CATS.Test.ifmo_html_data));
    CATS.App.register_adapter(new CATS.Adapter.IfmoSchool());
    CATS.App.register_adapter(new CATS.Adapter.Ifmo_xml());
    CATS.App.register_adapter(new CATS.Adapter.Codeforces());
    CATS.App.register_adapter(new CATS.Adapter.Cats());
    CATS.App.register_adapter(new CATS.Adapter.MyIcpc('app/tests/myicpc.xml'));
    CATS.App.register_adapter(new CATS.Adapter.Aizu());
    CATS.App.register_adapter(new CATS.Adapter.Domjudge());
    CATS.App.register_adapter(new CATS.Adapter.CodeChef());
    CATS.App.register_adapter(new CATS.Adapter.IOInformatics());
    CATS.App.register_adapter(new CATS.Adapter.Default());
    CATS.App.register_rule(new CATS.Rule.Acm());
    CATS.App.register_rule(new CATS.Rule.School());

    var templates = {
        header_rank_table: rt_header,
        header_contests_list: cl_header,
        pagination: pg,
        footer: footer,
        pages: {
            charts: charts,
            chart: {
                panel: charts_p,
                body: charts_b
            },
            settings: {
                table: tbl_set,
                contests: cnt_set,
                charts: charts_set
            },
            skins: {
                default: {
                    table_acm: d_tbl_acm,
                    table_school: d_tbl_sch,
                    history: d_hist,
                    contests: d_contests
                },
                ifmo: {
                    table_acm: ifmo_tbl_acm,
                    table_school: ifmo_tbl_sch,
                    history: ifmo_hist,
                    contests: ifmo_contests
                },
                codeforces: {
                    table_acm: cf_tbl_acm,
                    table_school: cf_tbl_sch,
                    history: cf_hist,
                    contests: cf_contests
                },
                cats: {
                    table_acm: cats_tbl_acm,
                    table_school: cats_tbl_sch,
                    history: cats_hist,
                    contests: cats_contests
                },
                opencup: {
                    table_acm: oc_tbl_acm,
                    table_school: oc_tbl_sch,
                    history: oc_hist,
                    contests: oc_contests
                },
                myicpc: {
                    table_acm: my_tbl_acm,
                    table_school: my_tbl_sch,
                    history: my_hist,
                    contests: my_contests
                },
                domjudge: {
                    table_acm: dj_tbl_acm,
                    table_school: dj_tbl_sch,
                    history: dj_hist,
                    contests: dj_contests
                },
                kattis: {
                    table_acm: ka_tbl_acm,
                    table_school: ka_tbl_sch,
                    history: ka_hist,
                    contests: ka_contests
                },
                uri: {
                    table_acm: ur_tbl_acm
                    //table_school: ur_tbl_sch,
                    //history: ur_hist,
                    //contests: ur_contests,
                },
                aizu: {
                    table_acm: az_tbl_acm
                    //table_school: ur_tbl_sch,
                    //history: ur_hist,
                    //contests: ur_contests,
                },
                ioinformatics: {
                    table_school: ioi_tbl_sch
                    //contests: ur_contests,
                }
            }
        }
    };

    var view = new CATS.View(templates, 'app/templates');

    view.display({});
}