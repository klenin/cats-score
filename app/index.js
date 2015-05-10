function cats_score_init(
    rt_header,
    cl_header,
    pg,
    footer,
    chart,
    tbl_filter,
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
    dj_contests
) {
    CATS.Config.proxy_path = "/cats/score/";

    CATS.App = new CATS.Controller();
    CATS.App.register_adapter(new CATS.Adapter.Cats_xml_hist([-1], CATS.Test.cats_xml_data));
    CATS.App.register_adapter(new CATS.Adapter.Cats_rank_table([-1], CATS.Test.cats_rank_table_json_data));
    CATS.App.register_adapter(new CATS.Adapter.Ifmo([-1], CATS.Test.ifmo_html_data));
    CATS.App.register_adapter(new CATS.Adapter.Codeforces([-1]));
    CATS.App.register_adapter(new CATS.Adapter.Cats([-1]));
    CATS.App.register_adapter(new CATS.Adapter.Default([-1]));
    CATS.App.register_rule(new CATS.Rule.Acm());
    CATS.App.register_rule(new CATS.Rule.School());

    var templates = {
        header_rank_table : rt_header,
        header_contests_list : cl_header,
        pagination : pg,
        footer : footer,
        pages : {
            chart : chart,
            filters : {
                table: tbl_filter,
            },
            skins : {
                default : {
                    table_acm : d_tbl_acm,
                    table_school : d_tbl_sch,
                    history : d_hist,
                    contests : d_contests,
                },
                ifmo : {
                    table_acm : ifmo_tbl_acm,
                    table_school : ifmo_tbl_sch,
                    history : ifmo_hist,
                    contests : ifmo_contests,
                },
                codeforces : {
                    table_acm : cf_tbl_acm,
                    table_school : cf_tbl_sch,
                    history : cf_hist,
                    contests : cf_contests,
                },
                cats : {
                    table_acm : cats_tbl_acm,
                    table_school : cats_tbl_sch,
                    history : cats_hist,
                    contests : cats_contests,
                },
                opencup : {
                    table_acm : oc_tbl_acm,
                    table_school : oc_tbl_sch,
                    history : oc_hist,
                    contests : oc_contests,
                },
                myicpc : {
                    table_acm : my_tbl_acm,
                    table_school : my_tbl_sch,
                    history : my_hist,
                    contests : my_contests,
                },
                domjudge : {
                    table_acm : dj_tbl_acm,
                    table_school : dj_tbl_sch,
                    history : dj_hist,
                    contests : dj_contests,
                },
            }
        }
    };

    var view = new CATS.View(templates, 'app/templates');

    view.display({});
}