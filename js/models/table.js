function Table_model(contest_start_time, problems) {
    this.name = 'table';
    this.problems = problems == undefined ? [] : problems;
    this.score_board = [];

    this.contest_start_time = (contest_start_time == undefined) ? new Date() : contest_start_time;
}

Table_model.prototype.throw_teams_with_no_solutions = function() {
    var sb = this.score_board;
    var last_idx = -1;
    for(var i = 0; i < sb.length; ++i)
        if (sb[i]['penalty'] == 0) {
            last_idx = i;
            break;
        }

    this.score_board = sb.slice(0, last_idx);
}