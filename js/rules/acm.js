function Acm_rules(model) {
    this.model = model;
    this.failed_run_penalty = 20
}


Acm_rules.prototype.compute_history = function() {
    var tbl = this.model.table;
    var info = this.model.contest_info;
    var contest_start_time = info.contest_start_time;
    var m = new History_model();
    var team_id = 0, id = 0;
    $.each(tbl.score_board, function (i, row) {
        var team_name = row['team_name'];
        team_id++;
        $.each(row['problems'], function (k, v) {
            for(var i = 0; i < v['runs_cnt']; ++i) {
                id++;
                var run = m.get_empty_score_board_run();
                run['problem_title'] = info.problems[k];
                run['submit_time'] = add_time(contest_start_time, "0.1");
                run['team_name'] = team_name;
                run['team_id'] = team_id;
                run['id'] = id;
                run['code'] = get_problem_code(k);

                if (v['solve_time'] && i + 1 == v['runs_cnt']) {
                    run['submit_time'] = add_time(contest_start_time, v['solve_time']);
                    run['state'] = 'accepted';
                }
                m.runs.push(run);
            }
        });
    });

    this.model.history = m;
}

Acm_rules.prototype.compute_table = function() {
    var self = this;
    var hist = this.model.history;
    var info = this.model.contest_info;
    var contest_start_time = info.contest_start_time;
    var m = new Table_model();
    var teams_problems = {}, teams = {};

    $.each(hist.runs, function (i, row) {
        var team_name = row['team_name'];
        if (teams_problems[team_name] == undefined) {
            teams_problems[team_name] = [];
            teams[team_name] = {};
            teams[team_name]['penalty'] = 0;
            teams[team_name]['solved_cnts'] = 0;

            for(var i = 0; i < info.problems.length; ++i) {
                teams_problems[team_name][i] = {};
                teams_problems[team_name][i]['solve_time'] = false;
                teams_problems[team_name][i]['runs_cnt'] = 0;
            }
        }
        var p_id = get_problem_id(row['code']);

        if (!teams_problems[team_name][p_id]['solve_time']) {
            teams_problems[team_name][p_id]['runs_cnt']++;
            if (row['state'] == 'accepted') {
                var submit = string_to_date(row['submit_time']);
                teams_problems[team_name][p_id]['solve_time'] = get_time_diff(contest_start_time, submit);
                teams[team_name]['solved_cnts']++;
                teams[team_name]['penalty'] += (teams_problems[team_name][p_id]['runs_cnt'] - 1) * self.failed_run_penalty +
                    teams_problems[team_name][p_id]['solve_time'];
            }
        }

    });

    var team_groups = [];
    $.each(teams, function (k, v) {
        if (team_groups[v['solved_cnts']] == undefined)
            team_groups[v['solved_cnts']] = [];

        team_groups[v['solved_cnts']].push({'n' : k, 'p' : v['penalty']});
    });

    for(var i = team_groups.length - 1; i >= 0; --i) {
        if (team_groups[i] == undefined)
            continue;
        var group = team_groups[i].sort(function (a, b) {
            return a['p'] - b['p'];
        })
        for(var j = 0; j < group.length; ++j) {

            var score_board_row = m.get_empty_score_board_row();
            score_board_row['place'] = (j != 0 && group[j - 1]['p'] == group[j]['p']) ?
                m.score_board.top()['place'] :
                m.score_board.length + 1;
            score_board_row['team_name'] = group[j]['n'];
            score_board_row['penalty'] =  group[j]['p'];
            score_board_row['problems'] = teams_problems[group[j]['n']];

            m.score_board.push(score_board_row);
        }
    }

    this.model.table = m;
}

Acm_rules.prototype.set_model = function (model) {
    this.model = model;
    return this;
}