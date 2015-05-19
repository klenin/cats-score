CATS.Adapter.Domjudge = Classify({

    init : function(obj) {
        if (obj != undefined)
            this.obj = obj;
        this.name = 'domjudge';
        this.model = null;
    },

    get_users: function (contest, callback) {
        CATS.App.utils.proxy_get_json(this.url + 'teams', function (data) {
            $.each(data, function (k, v) {
                var user = CATS.Model.User();
                user.id = v.id;
                user.name = v.name;
                //user.is_remote = r.remote;
                user.role = 'in_contest';
                user.affiliation = { country: v.nationality, university: v.affiliation };
                CATS.App.add_object(user);
                contest.add_object(user);
            });
            callback();
        });
    },

    get_problems: function (contest, callback) {
        CATS.App.utils.proxy_get_json(this.url + 'problems', function (data) {
            $.each(data, function (k, v) {
                var problem = CATS.Model.Problem();
                problem.id = v.id;
                problem.code = v.shortname;
                problem.name = v.name;
                problem.baloon_color = v.color;
                CATS.App.add_object(problem);
                contest.add_object(problem);
            });
            callback();
        });
    },

    parse_score_board : function(contest_id, result_table, callback) {
        var self = this;
        var obj = this.obj;
        var problem_ids = [], problem_max_points = [];

        CATS.App.utils.proxy_get_json(this.url + 'contest', function (data) {
            var contest = self.add_contest(data);
            self.get_users(contest, function () {
                self.get_problems(contest, function () {
                    var problems = contest.problems;
                    CATS.App.utils.proxy_get_json(self.url + 'scoreboard', function (data) {
                        $.each(data, function (k, v) {
                            var row = result_table.get_empty_score_board_row();
                            row.user = k;
                            for(var i = 0; i < problems.length; ++i) {
                                var p = result_table.get_empty_problem_for_score_board_row();
                                var pv = v[problems[i]];
                                p.problem = problems[i];
                                p.is_solved = pv.is_correct;
                                p.runs_cnt = pv.num_submissions;
                                p.best_run_time = pv.time;
                                row.problems.push(p);
                                if (p.is_solved) {
                                    row.solved_cnt += 1;
                                    row.penalty += 1*p.best_run_time + 1*pv.penalty;
                                }
                            }
                            result_table.score_board.push(row);
                        });
                        result_table.score_board.sort(function (a, b) {
                            if (a.solved_cnt != b.solved_cnt) return b.solved_cnt - a.solved_cnt;
                            return a.penalty - b.penalty;
                        });
                        for (var i = 0; i < result_table.score_board.length; ++i)
                            result_table.score_board[i].place = i + 1;
                        callback();
                    });
                });
            });
        });
    },

    add_contest: function(v) {
        var contest = CATS.Model.Contest();
        contest.id = v.id;
        contest.name = v.name;
        contest.scoring = 'acm';
        contest.start_time = new Date(1*v.start);
        contest.finish_time = new Date(1*v.end);
        CATS.App.add_object(contest);
        return contest;
    },

    url: 'http://compprog.win.tue.nl/domjudge/api/',

    get_contests: function(callback) {
        var self = this;
        CATS.App.utils.proxy_get_json(this.url + 'contest', function(data) {
            callback([ self.add_contest(data).id ]);
        });
    },

    parse: function(contest_id, result_table, callback) {
        this.parse_score_board(contest_id, result_table, callback);
    }
});
