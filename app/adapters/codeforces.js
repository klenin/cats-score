CATS.Adapter.Codeforces = Classify({

    init : function() {
        this.name = "codeforces";
        this.contest_aliases = {
            id : 'id',
            name : 'name',
            startTimeSeconds : 'start_time',
        },
        this.rules_aliases = {
            ICPC : 'acm'
        }
    },

    parse_score_board: function(contest_id, cf_table, result_table) {
        var self = this;

        var contest = CATS.App.contests[contest_id];

        if (contest == undefined)
            contest = this.add_contest(cf_table.contest);

        var problem_list = [];
        $.each(cf_table.problems, function (k, v) {
            var prob = new CATS.Model.Problem();
            prob.name = prob.id = v['name'];
            prob.code = v['index'];
            CATS.App.add_object(prob);
            contest.add_object(prob);
            problem_list.push(prob.id);
        });

        $.each(cf_table.rows, function (k, v) {
            var user = new CATS.Model.User();
            user.name = "";
            $.each(v.party.members, function (k, v) {
                user.name += v.handle + ", ";
            });
            user.name = user.name.throw_last_chars(2);
            if (v.party.teamName != undefined)
                user.name += ' "' + v.party.teamName + '"';
            if (v.party.teamId != undefined)
            user.id = v.party.teamName;
            user.is_remote = v.party.ghost;
            user.time_offset = v.party.startTimeSeconds;
            CATS.App.add_object(user);
            contest.add_object(user);

            var row = result_table.get_empty_score_board_row();

            row['place'] = v.rank;
            row['penalty'] = v.penalty;
            row['user'] = user.id;
            var prob_num = 0;
            $.each(v.problemResults, function(k, v) {
                var prob = result_table.get_empty_problem_for_score_board_row();
                prob['problem'] = problem_list[prob_num++];
                prob['is_solved'] = v["bestSubmissionTimeSeconds"] != undefined;
                if (prob['is_solved']) {
                    prob['best_run_time'] = Math.round(
                        v["bestSubmissionTimeSeconds"] / 60
                    ); //we use minutes
                    row['solved_cnt']++;
                }
                prob['runs_cnt'] = v["rejectedAttemptCount"] + 1;

                row['problems'].push(prob);
            });

            result_table.score_board.push(row);
        });
    },

    add_contest: function(v) {
        var contest = CATS.Model.Contest();
        contest.id = v['id'];
        contest.name = v['name'];
        contest.start_time = v['startTimeSeconds'] != undefined
            ? v['startTimeSeconds'] : 0;
        contest.scoring = this.rules_aliases[v['type']];

        if (v['phase'] == 'FINISHED')
            contest.finish_time = contest.start_time + v['durationSeconds'] * 1000;

        contest.start_time = new Date(contest.start_time);
        contest.finish_time = new Date(contest.finish_time);
        CATS.App.add_object(contest);
        return contest;
    },

    url: 'http://codeforces.com',

    get_contests: function(callback) {
        var self = this;
        CATS.App.utils.json_get(
            this.url + '/api/contest.list?gym=true&jsonp=?',
            function (data) {
                var contests = [];
                $.each(data.result, function (k, v) {
                    self.add_contest(v);
                    contests.push(v['id']);
                });
                callback(contests);
            }
        );
    },

    get_contest: function(callback, contest_id) {
        CATS.App.utils.json_get(
            this.url + '/api/contest.standings?contestId=' +
            contest_id +
            "&from=1&count=10000000&showUnofficial=true&jsonp=?",
            function( data ) {
                callback(data.result);
        });
    },

    parse: function(contest_id, result_table, callback) {
        var self = this;
        this.get_contest(function (cf_table) {
            self.parse_score_board(contest_id, cf_table, result_table);
            callback();
        }, contest_id);
    }
});
