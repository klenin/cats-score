CATS.Model.Results_table = Classify(CATS.Model.Entity, {
    init: function () {
        this.$$parent();
        this.type = "result_table";
        this.contests = [];
        this.score_board = [];
        this.filters = {
            duration: {
                minutes: null,
                type: null,
            },
            user: null,
            affiliation: null,
        };
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
    },

    get_no_run_place: function (scoring) {
        return this.score_board.length == 0 ?
            1 : (
            (
                scoring == 'school' ?
                    this.score_board.top()['points_cnt'] > 0 :
                (scoring == 'acm' ?
                    this.score_board.top()['penalty'] > 0 :
                        false)
            ) ?
                this.score_board.top()['place'] + 1 :
                this.score_board.top()['place']
            );
    },

    add_no_run_users: function(users, scoring) {
        var last_place = this.get_no_run_place(scoring);
        var self = this;
        $.each(users, function (k, v) {
            if (!v)
                return;

            var score_board_row = self.get_empty_score_board_row();
            score_board_row['place'] = last_place;
            score_board_row['user'] = k;
            score_board_row['penalty'] = 0;
            score_board_row['solved_cnt'] = 0;
            score_board_row['points'] = 0;
            score_board_row['problems'] = self.get_empty_problems_field();

            self.score_board.push(score_board_row);
        });
    },

    get_empty_problems_field: function () {
        var empty_problems_field = [];

        for(var i = 0; i < this.contests.length; ++i) {
            var contest = CATS.App.contests[this.contests[i]];
            for (var j = 0; j < contest.problems.length; ++j) {
                empty_problems_field[j] = this.get_empty_problem_for_score_board_row();
                empty_problems_field[j]['is_solved'] = false;
                empty_problems_field[j]['runs_cnt'] = 0;
                empty_problems_field[j]['points'] = 0;
                empty_problems_field[j]['problem'] = contest.problems[j];
            }
        }

        return empty_problems_field;
    },

    add_group: function (group, teams_problems, scoring) {
        for (var j = 0; j < group.length; ++j) {
            var score_board_row = this.get_empty_score_board_row();
            score_board_row['place'] = (j != 0 &&
                    (
                        scoring == 'school' ?
                            group[j - 1]['points_cnt'] == group[j]['points_cnt'] :
                        (scoring == 'acm' ?
                            group[j - 1]['p'] == group[j]['p'] :
                            false))
                    ) ?
                this.score_board.top()['place'] :
                this.score_board.length + 1;
            score_board_row['user'] = group[j]['id'];
            score_board_row['penalty'] = group[j]['p'];
            score_board_row['solved_cnt'] = group[j]['solved_cnt'];
            score_board_row['points_cnt'] = group[j]['points_cnt'];
            score_board_row['problems'] = teams_problems[group[j]['id']];

            this.score_board.push(score_board_row);
        }
    },

    clean_score_board: function () {
        this.score_board = [];
    },

    apply_filters: function () {
        var old_score_board = this.score_board;
        this.score_board = [];
        var self = this;
        $.each(old_score_board, function (k, row) {
            var user = CATS.App.users[row['user']];
            if (self.filters.user == null || user.name.match(new RegExp(self.filters.user))) {
                if (self.filters.duration.type == 'scoreboard' &&
                    self.filters.duration.minutes != null)
                    for (var i = 0; i < row['problems'].length; ++i) {
                        if (row['problems'][i].is_solved && row['problems'][i].best_run_time > self.filters.duration.minutes) {
                            row['problems'][i].is_solved = false;
                            row['problems'][i].runs_cnt--;
                        }
                    }
                self.score_board.push(row);
            }
        });
    }
});