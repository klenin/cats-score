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
                    run['start_processing_time'] = add_time(contest_start_time, 0);
                    run['user'] = row['user'];

                    if (v['is_solved'] && i + 1 == v['runs_cnt']) {
                        run['start_processing_time'] = add_time(contest_start_time, v['best_run_time']);
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
        $.each(contest.runs, function (i, row_id) {
            var row = CATS.App.runs[row_id];
            var team_id = row['user'];
            if (teams_problems[team_id] == undefined) {
                teams_problems[team_id] = [];
                teams[team_id] = {};
                teams[team_id]['penalty'] = 0;
                teams[team_id]['solved_cnt'] = 0;

                for (var i = 0; i < contest.problems.length; ++i) {
                    teams_problems[team_id][i] = result_table.get_empty_problem_for_score_board_row();
                    teams_problems[team_id][i]['is_solved'] = false;
                    teams_problems[team_id][i]['runs_cnt'] = 0;
                    teams_problems[team_id][i]['problem'] = CATS.App.get_problem_by_code(get_problem_code_by_index(i))['name'];
                }
            }

            var p_idx = get_problem_index(CATS.App.problems[row['problem']]['code']);

            if (!teams_problems[team_id][p_idx]['is_solved']) {
                teams_problems[team_id][p_idx]['runs_cnt']++;
                if (row['status'] == 'accepted') {
                    var submit = string_to_date(row['start_processing_time']);
                    teams_problems[team_id][p_idx]['best_run_time'] = get_time_diff(contest_start_time, submit);
                    teams_problems[team_id][p_idx]['is_solved'] = true;
                    teams[team_id]['solved_cnt']++;
                    teams[team_id]['penalty'] += (teams_problems[team_id][p_idx]['runs_cnt'] - 1) * self.failed_run_penalty +
                        teams_problems[team_id][p_idx]['best_run_time'];
                }
            }

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
            })
            for (var j = 0; j < group.length; ++j) {

                var score_board_row = result_table.get_empty_score_board_row();
                score_board_row['place'] = (j != 0 && group[j - 1]['p'] == group[j]['p']) ?
                    result_table.score_board.top()['place'] :
                    result_table.score_board.length + 1;
                score_board_row['user'] = group[j]['id'];
                score_board_row['penalty'] = group[j]['p'];
                score_board_row['solved_cnt'] = group[j]['solved_cnt'];
                score_board_row['problems'] = teams_problems[group[j]['id']];

                result_table.score_board.push(score_board_row);
            }
        }
    },

    process: function (contest, result_table) {
        if (contest.runs.length == 0 && result_table.score_board.length > 0)
            this.compute_history(result_table, contest);
        else if (contest.runs.length > 0 && result_table.score_board.length == 0) {
            result_table.contests.push(contest.id);
            this.compute_table(result_table, contest);
        }
        else
            alert('ACM rule error. History and table both empty or filled');
    }
});