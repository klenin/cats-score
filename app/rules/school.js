CATS.Rule.School = Classify(CATS.Rule.Base, {

    init: function (model) {
        this.name = 'school';
    },

    compute_history: function (result_table, contest) {
        var contest_start_time = contest.start_time;
        _.each(result_table.score_board, function (row) {
            _.each(row.problems, function (p) {
                if (!p.points)
                    return;
                var run = CATS.Model.Run();
                run.problem = p.problem;
                run.user = row.user;
                run.contest = contest.id;
                run.start_processing_time = CATS.App.utils.add_time(contest.start_time, p.best_run_time ? p.best_run_time : 0);
                run.status = p.points === CATS.App.problems[run.problem].max_points ? 'accepted' : 'wrong_answer';
                run.points = p.points;
                run.prize = row.prize;
                CATS.App.add_object(run);
                contest.add_object(run);
            });
        });
    },

    compute_table_add_runs: function (result_table, contest, runs) {
        var teams_problems = {}, teams = {};

        _.each(runs, function (run) {
            var team_id = run.user;
            if (teams_problems[team_id] === undefined) {
                teams[team_id] = { solved_cnt: 0 };
                teams_problems[team_id] = result_table.get_empty_problems_field();
            }

            var tp = teams_problems[team_id][contest.get_problem_index(run.problem)];
            tp.runs_cnt++;
            tp.last_run_time = Math.floor(run.minutes_since_start());
            if (tp.points < run.points) {
                tp.best_run_time = tp.last_run_time;
                tp.points = run.points;
            }

            if (!tp.is_solved && run.status === 'accepted') {
                tp.is_solved = true;
                teams[team_id].solved_cnt++;
            }
            teams[team_id].prize = run.prize;
        });

        var users_no_runs = _.reduce(contest.users, function (r, u) { r[u] = true; return r; }, {});

        var teams_arr = _.map(teams, function (v, team_id) {
            var points_cnt = 0;
            for (var i = 0; i < contest.problems.length; ++i)
                points_cnt += teams_problems[team_id][i].points;
            users_no_runs[team_id] = false;
            return {
                id: team_id,
                solved_cnt : v.solved_cnt,
                points_cnt: points_cnt,
                prize: v.prize
            };
        });

        teams_arr.sort(function (a, b) { return b.points_cnt - a.points_cnt; });
        result_table.add_group(teams_arr, teams_problems, 'school');
        result_table.add_no_run_users(users_no_runs, 'school');
        result_table.apply_filters();
    },

});
