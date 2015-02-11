CATS.Adapter.Codeforces = Classify({

    init : function(cf_table) {
        this.cf_table = cf_table;
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

    parse_score_board: function(contest, result_table) {
        var self = this;
        var cf_table = this.cf_table;

        $.each(cf_table.contest, function (k, v) {
            if (self.contest_aliases[k] != undefined)
                contest[self.contest_aliases[k]] = v;
        })

        contest.scoring = this.rules_aliases[cf_table.contest.type];

        if (cf_table.contest.phase == 'FINISHED')
            contest.finish_time = contest.start_time + cf_table.contest.durationSeconds;

        contest.start_time = new Date(contest.start_time);
        contest.finish_time = new Date(contest.finish_time);

        var problem_list = [];
        $.each(cf_table.problems, function (k, v) {
            var prob = new CATS.Model.Problem();
            prob.name = prob.id = v['name'];
            prob.code = v['index'];
            CATS.App.add_object(prob);
            contest.add_object(prob);
            problem_list.push($(this).attr("title"));
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
                    prob['best_run_time'] = Math.round(v["bestSubmissionTimeSeconds"] / 60); //we use minutes
                    row['solved_cnt']++;
                }
                prob['runs_cnt'] = v["rejectedAttemptCount"] + 1;

                row['problems'].push(prob);
            });

            result_table.score_board.push(row);
        });
    },



    parse: function(contest, result_table) {
        this.parse_score_board(contest, result_table);
    }
});
