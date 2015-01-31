function History_model(runs) {
    this.name = 'history';
    this.runs = runs == undefined ? [] : runs;
}

History_model.prototype.get_empty_score_board_run = function() {
    return {
        'problem_title' : null,
        'failed_test' : null,
        'submit_time' : null,
        'team_name' : null,
        'team_id' : null,
        'is_remote' : null,
        'state' : null,
        'is_ooc' : null,
        'id' : null,
        'last_ip' : null,
        'code' : null
    };
}