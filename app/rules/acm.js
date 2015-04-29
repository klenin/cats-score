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
                    run['start_processing_time'] = CATS.App.utils.add_time(contest_start_time, 0);
                    run['user'] = row['user'];

                    if (v['is_solved'] && i + 1 == v['runs_cnt']) {
                        run['start_processing_time'] = CATS.App.utils.add_time(contest_start_time, v['best_run_time']);
                        run['status'] = 'accepted';
                    }
                    CATS.App.add_object(run);
                    contest.add_object(run);
                }
            });
        });
    },

    compute_table: function (result_table, contest) {
        var contest_start_time = contest.start_time;
        var teams_problems = {}, teams = {};
        var self = this;

        var empty_problems_field = [];
        for (var i = 0; i < contest.problems.length; ++i) {
            empty_problems_field[i] = result_table.get_empty_problem_for_score_board_row();
            empty_problems_field[i]['is_solved'] = false;
            empty_problems_field[i]['runs_cnt'] = 0;
            empty_problems_field[i]['problem'] = contest.problems[i];
        }

        $.each(contest.runs, function (i, row_id) {
            var row = CATS.App.runs[row_id];
            if (
                contest.duration_minutes != null &&
                CATS.App.utils.get_time_diff(contest_start_time, row['start_processing_time']) > contest.duration_minutes
            )
                return;

            var team_id = row['user'];
            if (teams_problems[team_id] == undefined) {
                teams[team_id] = {};
                teams[team_id]['penalty'] = 0;
                teams[team_id]['solved_cnt'] = 0;

                teams_problems[team_id] = JSON.parse(JSON.stringify(empty_problems_field));
            }

            var p_idx = contest.get_problem_index(row['problem']);

            if (!teams_problems[team_id][p_idx]['is_solved']) {
                teams_problems[team_id][p_idx]['runs_cnt']++;
                if (row['status'] == 'accepted') {
                    teams_problems[team_id][p_idx]['best_run_time'] = CATS.App.utils.get_time_diff(contest_start_time, row['start_processing_time']);
                    teams_problems[team_id][p_idx]['is_solved'] = true;
                    teams[team_id]['solved_cnt']++;
                    teams[team_id]['penalty'] += (teams_problems[team_id][p_idx]['runs_cnt'] - 1) * self.failed_run_penalty +
                    teams_problems[team_id][p_idx]['best_run_time'];
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
        });

        for (var i = team_groups.length - 1; i >= 0; --i) {
            if (team_groups[i] == undefined)
                continue;
            var group = team_groups[i].sort(function (a, b) {
                return a['p'] - b['p'];
            });
            for (var j = 0; j < group.length; ++j) {

                var score_board_row = result_table.get_empty_score_board_row();
                score_board_row['place'] = (j != 0 && group[j - 1]['p'] == group[j]['p']) ?
                    result_table.score_board.top()['place'] :
                    result_table.score_board.length + 1;
                score_board_row['user'] = group[j]['id'];
                users_no_runs[score_board_row['user']] = false;
                score_board_row['penalty'] = group[j]['p'];
                score_board_row['solved_cnt'] = group[j]['solved_cnt'];
                score_board_row['problems'] = teams_problems[group[j]['id']];

                result_table.score_board.push(score_board_row);
            }
        }

        var last_place = result_table.score_board.length > 0 ?
            result_table.score_board.top()['place'] + 1 :
            1;

        $.each(users_no_runs, function (k, v) {
            if (!v)
                return;

            var score_board_row = result_table.get_empty_score_board_row();
            score_board_row['place'] = last_place;
            score_board_row['user'] = k;
            score_board_row['penalty'] = 0;
            score_board_row['solved_cnt'] = 0;
            score_board_row['problems'] = empty_problems_field;

            result_table.score_board.push(score_board_row);
        });
    },

    process: function (contest, result_table) {
        if (contest.runs.length == 0 && result_table.score_board.length > 0)
            this.compute_history(result_table, contest);
        else if (contest.runs.length > 0 && result_table.score_board.length == 0) {
            result_table.contests.push(contest.id);
            this.compute_table(result_table, contest);
        }
        // else
        //     alert('ACM rule error. History and table both empty or filled');
    }
});