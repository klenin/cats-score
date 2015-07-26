CATS.Adapter.CodeChef = Classify({

    init : function(page) {
        if (page != undefined)
            this.page = page;
        this.name = 'codechef';
        this.model = null;
    },

    add_row: function (result_table, v) {
        var row = result_table.get_empty_score_board_row();
        row.place = v.rank;
        row.user = v.user_handle;
        var user = new CATS.Model.User();
        user.name = user.id = row.user;
        user.affiliation.country = v.country;
        CATS.App.add_object(user);
        this.contest.add_object(user);
        for (var i = 0; i < this.contest.problems.length; ++i) {
            var prob = result_table.get_empty_problem_for_score_board_row();
            prob.problem = this.contest.problems[i];
            var pv = v.problems_status[prob.problem];
            prob.points = pv == undefined ? 0 : pv.score;
            prob.is_solved = prob.points > 0;
            if (prob.is_solved) {
                row.solved_cnt++;
                row.run_cnt++;
            }
            var pd = CATS.App.problems[prob.problem];
            pd.max_points = Math.max(pd.max_points, prob.points);
            row.problems.push(prob);
        }
        row.penalty = v.penalty;
        result_table.score_board.push(row);
    },

    add_problem: function (v) {
        var p = new CATS.Model.Problem();
        p.id = p.code = v.code;
        p.name = v.name;
        CATS.App.add_object(p);
        this.contest.add_object(p);
    },

    add_contest: function(v) {
        var contest = CATS.Model.Contest();
        var c = v.children('td');
        contest.id = $(c[0]).text();
        contest.name = $(c[1]).text();
        contest.scoring = 'school';
        contest.start_time = new Date($(c[2]).attr('data-starttime'));
        contest.finish_time = new Date($(c[3]).attr('data-endtime'));
        CATS.App.add_object(contest);
        return contest;
    },

    add_contest_json: function (v) {
        var contest = CATS.Model.Contest();
        contest.name = contest.id = v.contest_code;
        contest.scoring = v.is_team_based ? 'acm' : 'school';
        contest.start_time = new Date();
        contest.finish_time = CATS.App.utils.add_time(new Date(), 300);
        CATS.App.add_object(contest);
        return contest;
    },

    url: 'https://www.codechef.com/',

    get_contests: function(callback) {
        var that = this;
        var contest_ids = [];
        CATS.App.utils.proxy_get(this.url + 'contests', function (data) {
            $(data).find('div.table-questions tr[class!="headerrow"]').each(function(k, v) {
                contest_ids.push(that.add_contest($(v)).id);
            });
            callback(contest_ids);
        });
    },

    parse: function(contest_id, result_table, callback) {
        var that = this;
        CATS.App.utils.proxy_get_json(
            this.url + 'api/rankings/' + contest_id + '?itemsPerPage=100&order=asc&sort_by=rank&page=1',
            function (data) {
                that.contest = CATS.App.contests[contest_id];
                if (that.contest == undefined)
                    that.contest = that.add_contest_json(data.contest_info);
                result_table.scoring = that.contest.scoring;
                _.each(data.problems, function (v) { that.add_problem(v); });
                _.each(data.list, function (v) { that.add_row(result_table, v) });
                callback();
            }
        );
    }
});
