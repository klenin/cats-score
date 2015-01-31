function Table_model(score_board) {
    this.score_board = score_board == undefined ? [] : score_board;
}

Table_model.prototype.get_empty_score_board_row = function() {
    return {
        'place' : null,
        'team_name' : null,
        'penalty' : null,
        'is_remote' : null,
        'is_ooc' : null,
        'problems' : []
    };
}

Table_model.prototype.get_empty_problem_for_score_board_row = function() {
    return {
        'solve_time' : null,
        'runs_cnt' : null
    };
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