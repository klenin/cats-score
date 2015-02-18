CATS.Model.Results_table = Classify(CATS.Model.Entity, {
    init: function () {
        this.$$parent();
        this.type = "result_table";
        this.contests = [];
        this.score_board = [];
    },

    get_empty_score_board_row: function () {
        return {
            place: null,
            user: null,
            penalty: null,
            solved_cnt: 0,
            problems: []
        };
    },

    get_empty_problem_for_score_board_row: function () {
        return {
            problem: null,
            is_solved: null,
            runs_cnt: null,
            last_run_time : null,
            best_run_time : null,
            points : null
        };
    },

    throw_teams_with_no_solutions: function () {
        var sb = this.score_board;
        var last_idx = -1;
        for (var i = 0; i < sb.length; ++i)
            if (sb[i]['penalty'] == 0) {
                last_idx = i;
                break;
            }

        this.score_board = sb.slice(0, last_idx);
    }
});