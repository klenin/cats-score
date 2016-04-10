"use strict";
CATS.Adapter.IOInformatics = Classify({

    init : function(page) {
        if (page != undefined)
            this.page = page;
        this.name = 'ioinformatics';
        this.model = null;
    },

    add_row: function (result_table, tds) {
        var row = result_table.get_empty_score_board_row();
        row.place = $(tds[0]).text();
        row.user = $(tds[1]).text();
        var user = new CATS.Model.User();
        user.name = user.id = row.user;
        user.affiliation.country = $(tds[2]).text();
        CATS.App.add_object(user);
        this.contest.add_object(user);
        for (var i = 0; i < this.contest.problems.length; ++i) {
            var prob = result_table.get_empty_problem_for_score_board_row();
            prob.problem = this.contest.problems[i];
            prob.points = parseFloat($(tds[i + 3]).text());
            if (isNaN(prob.points)) {
                prob.points = 0;
            }

            prob.is_solved = prob.points > 0;
            if (prob.is_solved) {
                row.solved_cnt++;
                row.run_cnt++;
            }
            var pd = CATS.App.problems[prob.problem];
            pd.max_points = Math.max(pd.max_points, prob.points);
            row.problems.push(prob);
        }
        result_table.score_board.push(row);
    },

    add_problem: function (id, code, name) {
        var p = new CATS.Model.Problem();
        p.id = id;
        p.code = code;
        p.name = name;
        CATS.App.add_object(p);
        this.contest.add_object(p);
    },

    add_contest: function(year, name) {
        var contest = CATS.Model.Contest();
        contest.id = year;
        contest.name = name + ' ' + year;
        contest.scoring = 'school';
        contest.start_time = new Date();
        contest.start_time.setYear(year);
        contest.finish_time = CATS.App.utils.add_time(contest.start_time, 300);
        CATS.App.add_object(contest);
        return contest;
    },

    url: 'http://stats.ioinformatics.org/',

    get_contests: function(callback) {
        var that = this;
        var contest_ids = [];
        CATS.App.utils.proxy_get(this.url + 'olympiads/', function (data) {
            $(data).find('table[border="1"] tr:not(:first)').each(function(k, v) {
                var c = $(v).children('td');
                contest_ids.push(that.add_contest($(c[1]).text(), $(c[3]).text()).id);
            });
            callback(contest_ids);
        });
    },

    parse: function(contest_id, result_table, callback) {
        var that = this;
        CATS.App.utils.proxy_get_html(
            this.url + 'results/' + contest_id,
            function (data) {
                that.contest = CATS.App.contests[contest_id];
                if (that.contest == undefined)
                    that.contest = that.add_contest(contest_id, 'IOI');
                $(data).find('table[border="1"] tr:first').each(function(k, v) {
                    var tds = $(v).children('th.taskscore').each(function(k1, v1) {
                        var cell = $(v1);
                        var url = cell.children('a').attr('href').split('/');
                        that.add_problem(url[1] + url[2], $(v1).text(), url[2]);
                    });
                });
                $(data).find('table[border="1"] tr:not(:first)').each(function(k, v) {
                    that.add_row(result_table, $(v).children('td'));
                });
                callback();
            }
        );
    }
});
