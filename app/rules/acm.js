CATS.Rule.Acm = Classify({
    init: function (model) {
        this.name = "acm";
        this.failed_run_penalty = 20;
    },

    compute_history: function (result_table, contest) {
        var tbl = result_table;
        var contest_start_time = contest.start_time;
        $.each(tbl.score_board, function (i, row) {
            $.each(row['problems'], function (k, v) {
                for (var i = 0; i < v['runs_cnt']; ++i) {
                    var run = CATS.Model.Run();
                    run['problem'] = v['problem'];
                    run['start_processing_time'] = CATS.App.utils.add_time(contest_start_time, Math.round(contest.compute_duration_minutes() / 2));
                    run['user'] = row['user'];
                    run['contest'] = contest.id;

                    if (v['is_solved'] && i + 1 == v['runs_cnt']) {
                        run['start_processing_time'] = CATS.App.utils.add_time(contest_start_time, v['best_run_time']);
                        run['status'] = 'accepted';
                    }
                    else
                        run['status'] = 'wrong_answer';
                    CATS.App.add_object(run);
                    contest.add_object(run);
                }
            });
        });
        contest.sort_runs();
    },

    compute_table: function (result_table, contest) {
        var teams_problems = {}, teams = {};
        var self = this;

        $.each(contest.runs, function (i, row_id) {
            var row = CATS.App.runs[row_id];
            if (
                result_table.filters.duration.type == 'history' &&
                result_table.filters.duration.minutes != null &&
                CATS.App.utils.get_time_diff(CATS.App.contests[row.contest].start_time, row['start_processing_time']) > result_table.filters.duration.minutes
            )
                return;

            var team_id = row['user'];
            if (teams_problems[team_id] == undefined) {
                teams[team_id] = {};
                teams[team_id]['penalty'] = 0;
                teams[team_id]['solved_cnt'] = 0;

                teams_problems[team_id] = result_table.get_empty_problems_field();
            }

            var p_idx = contest.get_problem_index(row['problem']);

            if (!teams_problems[team_id][p_idx]['is_solved']) {
                teams_problems[team_id][p_idx].runs_cnt++;
                teams_problems[team_id][p_idx].best_run_time =
                    CATS.App.utils.get_time_diff(CATS.App.contests[row.contest].start_time, row.start_processing_time);

                if (row.status == 'accepted') {
                    teams_problems[team_id][p_idx].is_solved = true;
                    teams[team_id].solved_cnt++;
                    teams[team_id].penalty +=
                        (teams_problems[team_id][p_idx].runs_cnt - 1) * self.failed_run_penalty +
                        teams_problems[team_id][p_idx].best_run_time;
                }
            }

        });

        var users_no_runs = {};
        $.each(contest.users, function (k, v) {
            users_no_runs[v] = true;
        });

        var team_groups = [];
        $.each(teams, function (k, v) {
            if (team_groups[v['solved_cnt']] == undefined)
                team_groups[v['solved_cnt']] = [];

            team_groups[v['solved_cnt']].push({'id': k, 'p': v['penalty'], 'solved_cnt' : v['solved_cnt']});
            users_no_runs[k] = false;
        });

        for (var i = team_groups.length - 1; i >= 0; --i) {
            if (team_groups[i] == undefined)
                continue;
            var group = team_groups[i].sort(function (a, b) {
                return a['p'] - b['p'];
            });
            result_table.add_group(group, teams_problems, 'acm');
        }

        result_table.add_no_run_users(users_no_runs, 'acm');
        result_table.apply_filters();
    },

    process: function (contest, result_table) {
        if (contest.runs.length == 0 && result_table.score_board.length > 0)
            this.compute_history(result_table, contest);
        else if (contest.runs.length > 0 && result_table.score_board.length == 0) 
            this.compute_table(result_table, contest);
    }
});