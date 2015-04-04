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
            points_cnt: 0,
            problems: []
        };
    },

    get_empty_problem_for_score_board_row: function () {
        return {
            problem: null,
            is_solved: null,
            opener: null,
            runs_cnt: null,
            last_run_time : null,
            best_run_time : null,
            points : null
        };
    },

    define_openers: function() {
        var sb = this.score_board;
        var openers = [];
        for (var i = 0; i < sb[0]['problems'].length; ++i)
            openers[i] = {min_time: 10000000000, idx: -1};

        for (var i = 0; i < sb.length; ++i)
            for(var j = 0; j < sb[i]['problems'].length; ++j) {
                var p = sb[i]['problems'][j];
                if (p.is_solved && p.best_run_time < openers[j].min_time) {
                    openers[j].min_time = p.best_run_time;
                    openers[j].idx = i;
                }
            }

        for (var i = 0; i < openers.length; ++i)
            if (openers[i].idx != -1)
                sb[openers[i].idx].problems[i].opener = true;
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