CATS.Adapter.Ifmo = Classify({
    init : function(page) {
        if (page != undefined)
            this.page = page;

        this.name = 'ifmo';
    },

    assert: function (b, msg) {
        if (!b) throw "Assertion failed " + msg;
    },

    parse_contest_dates: function (contest, timingText) {
console.log(timingText);
        var tp = timingText.match(/(\d+):(\d+):(\d+)\s+of\s+(\d+):(\d+):(\d+)/);
        contest.start_time = new Date();
        contest.start_time.setHours(contest.start_time.getHours() - tp[1]);
        contest.start_time.setMinutes(contest.start_time.getMinutes() - tp[2]);
        contest.start_time.setSeconds(contest.start_time.getSeconds() - tp[3]);

        contest.finish_time = new Date(contest.start_time);
        contest.finish_time.setHours(contest.finish_time.getHours() + 1*tp[4]);
        contest.finish_time.setMinutes(contest.finish_time.getMinutes() + 1*tp[5]);
        contest.finish_time.setSeconds(contest.finish_time.getSeconds() + 1*tp[6]);

        contest.freeze_time = new Date(contest.finish_time);
        contest.freeze_time.setHours(contest.finish_time.getHours() - 1);
    },

    parse_score_board: function(contest_id, result_table) {
        var page = this.page;
        var contest = CATS.App.contests[contest_id];
        if (contest == undefined)
            contest = this.add_contest({id: contest_id, name: 'NEERC ' + contest_id});

        var self = this;
        var wrapper = $('<div/>').append(page).find('table.wrapper');
        self.parse_contest_dates(contest, wrapper.find('tbody>tr>td>center>p').first().text());
        var standings = wrapper.find('table.standings');
        var header = standings.find('thead>tr');
        var source_rows = standings.find('tbody>tr');
        result_table.scoring = 'acm';
        var problems = [];
        header.children('th.problem').each(function () {
            var prob = $.extend(new CATS.Model.Problem(), {
                id: $(this).text(),
                name: $(this).attr('title'),
                code: $(this).text()
            });
            CATS.App.add_object(prob);
            contest.add_object(prob);
            problems.push(prob.id);
        });
        _.each(source_rows, function (source_row) {
            var items = $(source_row).children('td');
            if (!$(items[0]).hasClass('rankl')) return;

            var row = result_table.get_empty_score_board_row();
            row.place = parseInt($(items[0]).text());

            self.assert($(items[1]).hasClass('party'));
            row.user = $(items[1]).text();
            var user = new CATS.Model.User();
            user.name = user.id = row.user;
            CATS.App.add_object(user);
            contest.add_object(user);

            for (var i = 0; i < problems.length; ++i) {
                var p = $(items[i + 2]);
                var prob = result_table.get_empty_problem_for_score_board_row();
                prob.problem = problems[i];
                var solved_src = p.children('i');
                prob.is_solved = solved_src.length > 0;
                if (prob.is_solved) {
                    var runs_cnt_text = solved_src.contents()[0].nodeValue;
                    prob.runs_cnt = runs_cnt_text === '+' ? 1 : parseInt(runs_cnt_text) + 1;
                    prob.best_run_time = parseInt(solved_src.children('s').text().split(':')[0]); 
                    ++row.solved_cnt;
                }
                else {
                    var tried_src = p.children('b');
                    if (tried_src.length > 0)
                        prob.runs_cnt = -parseInt(tried_src.text());
                }
                row.problems.push(prob);
            }

            self.assert(parseInt($(items[i + 2]).text()) === row.solved_cnt, $(items[i + 2]).text());
            self.assert($(items[i + 3]).hasClass('penalty'));
            row.penalty = parseInt($(items[i + 3]).text());

            result_table.score_board.push(row);
        });
    },

    add_contest: function(v) {
        var contest = CATS.Model.Contest(), contests = [];
        contest.id = v.id;
        contest.name = v.name;
        contest.scoring = 'acm';
        contest.start_time = new Date();
        contest.finish_time = CATS.App.utils.add_time(contest.start_time, 300);
        CATS.App.add_object(contest);
        return contest;
    },

    url: 'http://neerc.ifmo.ru/',
    minimal_year: 2000,

    get_contests: function(callback) {
        var self = this;
        CATS.App.utils.cors_get_html(this.url + 'past/index.html', function (page) {
            var contests = [];
            var c = { id: 'current', name: 'Current' };
            self.add_contest(c);
            contests.push(c.id);
            $(page).find('td.neercyear a').each(function () {
                var year = $(this).text().match(/\d+/g)[0];
                if (year <= self.minimal_year)
                    return;
                var c = { id: year, name: $(this).text() };
                self.add_contest(c);
                contests.push(c.id);
            });
            callback(contests);
        })
    },

    get_contest: function(callback, contest_id) {
        var url_part = contest_id == 'current' ? 'information' : 'past/' + contest_id;
        CATS.App.utils.cors_get_html(this.url + url_part + '/standings.html', callback);
    },

    parse: function(contest_id, result_table, callback) {
        var self = this;
        this.get_contest(function (page) {
            self.page = page;
            self.parse_score_board(contest_id, result_table);
            callback();
        }, contest_id);
    }
});
