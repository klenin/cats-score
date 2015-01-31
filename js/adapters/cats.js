function Cats_adapter(page, model) {
    this.page = page;
    this.model = model;

    this.aliases = {
        'problem_title' : 'problem_title',
        'failed_test' : 'failed_test',
        'submit_time' : 'submit_time',
        'team_name' : 'team_name',
        'team_id' : 'team_id',
        'is_remote' : 'is_remote',
        'state' : 'state',
        'is_ooc' : 'is_ooc',
        'id' : 'id',
        'last_ip' : 'last_ip',
        'code' : 'code'
    }
}


Cats_adapter.prototype.parse_history = function() {
    var self = this;
    var page = $.parseXML(this.page);

    $(page).find('reqs').find('req').each(function () {
        var row = self.model.history.get_empty_score_board_run();

        $(this).children().each(function() {
            if (self.aliases[$(this)[0].tagName] != undefined)
                row[self.aliases[$(this)[0].tagName]] = $(this).text();
        });
        self.model.contest_info.problems[get_problem_id(row['code'])] = row['problem_title'];
        self.model.history.runs.push(row);
    });

    var r = new Acm_rules(self.model);
    r.compute_table();
}

Cats_adapter.prototype.parse = function() {
    if (this.model.history.runs.length == 0)
        this.parse_history();

    return this.model;
}