CATS.Rule.Acm = Classify(CATS.Rule.Base, {

    init: function (model) {
        this.name = 'acm';
        this.failed_run_penalty = 20;
    },

    compute_history: function (result_table, contest) {
        _.each(result_table.score_board, function (row) {
            _.each(row.problems, function (v) {
                for (var i = 0; i < v.runs_cnt; ++i) {
                    var run = CATS.Model.Run();
                    run.problem = v.problem;
                    run.user = row.user;
                    run.contest = contest.id;

                    if (v.is_solved && i + 1 === v.runs_cnt) {
                        run.start_processing_time = CATS.App.utils.add_time(contest.start_time, v.best_run_time);
                        run.status = 'accepted';
                    }
                    else {
                        var d = Math.round((v.best_run_time ? v.best_run_time : contest.compute_duration_minutes()) / 2);
                        run.start_processing_time = CATS.App.utils.add_time(contest.start_time, d);
                        run.status = 'wrong_answer';
                    }
                    CATS.App.add_object(run);
                    contest.add_object(run);
                }
            });
        });
        contest.sort_runs();
    },

    compute_table_add_runs: function (result_table, contest, runs) {
        var teams_problems = {}, teams = {};
        var self = this;

        _.each(runs, function (run) {
            var team_id = run.user;
            if (teams_problems[team_id] === undefined) {
                teams[team_id] = { penalty: 0, solved_cnt: 0 };
                teams_problems[team_id] = result_table.get_empty_problems_field();
            }

            var tp = teams_problems[team_id][contest.get_problem_index(run.problem)];
            if (tp.is_solved)
                return;
            tp.runs_cnt++;
            tp.best_run_time = Math.floor(run.minutes_since_start());
            if (run.status === 'accepted') {
                tp.is_solved = true;
                teams[team_id].solved_cnt++;
                teams[team_id].penalty += (tp.runs_cnt - 1) * self.failed_run_penalty + tp.best_run_time;
            }
        });

        var users_no_runs = _.reduce(contest.users, function (r, u) { r[u] = true; return r; }, {});

        var team_groups = [];
        _.each(teams, function (v, team_id) {
            if (team_groups[v.solved_cnt] === undefined)
                team_groups[v.solved_cnt] = [];

            team_groups[v.solved_cnt].push({ id: team_id, p: v.penalty, solved_cnt: v.solved_cnt });
            users_no_runs[team_id] = false;
        });

        for (var i = team_groups.length - 1; i >= 0; --i) {
            if (team_groups[i] === undefined)
                continue;
            var group = team_groups[i].sort(function (a, b) { return a.p - b.p; });
            result_table.add_group(group, teams_problems, 'acm');
        }

        result_table.add_no_run_users(users_no_runs, 'acm');
        result_table.apply_filters();
    },

});
