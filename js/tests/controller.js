function Controller_tests() {

}



Controller_tests.prototype.run_tests = function() {
    var result = "<strong>test 1(ifmo table src): </strong>" + this.run_ifmo_test() + "<br />" +
        "<strong>test 2(cats history src): </strong>" + this.run_cats_test() + "<br />";

    return result;
}

Controller_tests.prototype.models_equals = function(m, m2) {
    var result = JSON.stringify(m) == JSON.stringify(m2);
    return result ? "OK" :
        "FAIL <br />" + JSON.stringify(m) +
        " <br /><br /> " + JSON.stringify(m2) +
        " <br /><br /> ";
}

Controller_tests.prototype.acm_table_equals = function(m, m2) {
    m.throw_teams_with_no_solutions();
    m2.throw_teams_with_no_solutions();
    var result = JSON.stringify(m) == JSON.stringify(m2);
    return result ? "OK" :
    "FAIL <br />" + JSON.stringify(m) +
    " <br /><br /> " + JSON.stringify(m2) +
    " <br /><br /> ";
}

Controller_tests.prototype.run_ifmo_test = function() {
    var c = new Contest_model();
    var a = new Ifmo_adapter(ifmo_html_data_for_test, c);
    a.parse();
    var r = new Acm_rules(c);
    var t1 = c.table;
    r.compute_table();
    var t2 = c.table;
    return this.acm_table_equals(t1, t2);
}

Controller_tests.prototype.run_cats_test = function() {
    var cats_contest_info = new Contest_info_model(string_to_date("07.11.2014 18:00"), ["Second Best", "Customer support"]);
    var c = new Contest_model();
    c.contest_info = cats_contest_info;
    var a = new Cats_adapter(cats_xml_data_for_test, c);
    a.parse();
    var r = new Acm_rules(c);
    var t1 = c.table;
    r.compute_history();
    r.compute_table();
    var t2 = c.table;
    return this.acm_table_equals(t1, t2);
}