function Table_model() {
    this.problems = [];
    this.score_board = [];
}

Table_model.prototype.translate_to_history = function(contest_start_time) {
    var m = new History_model();
    if (contest_start_time == undefined)
        contest_start_time = new Date();
    var self = this;
    var team_id = 0, id = 0;
    $.each(self.score_board, function (i, row) {
        var team_name = row['team_name'];
        team_id++;
        $.each(row, function (k, v) {
            if (self.problems[k] != undefined)
                for(var i = 0; i < v['r']; ++i) {
                    id++;
                    var run = {
                        'time_since_start' : 0.1,
                        'problem_title' : self.problems[i],
                        'submit_time' : contest_start_time,
                        'team_name' : team_name,
                        'team_id' : team_id,
                        'is_remote' : 0,
                        'state' : 'wrong_answer',
                        'is_ooc' : 1,
                        'id' : id,
                        'last_ip' : 'localhost',
                        'code' : get_problem_code(i)}
                    if (v['s'] && i + 1 == v['r']) {
                        run['submit_time'] = add_time(contest_start_time, v['s']);
                        run['state'] = 'accepted';
                    }
                    m.runs.push(run);
                }
        });
    });

    return m;
}