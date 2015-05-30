CATS.Adapter.Ifmo = Classify({
    init : function(page) {
        if (page != undefined)
            this.page = page;

        this.name = 'ifmo';
        this.aliases = {
            'rankl' : 'place',
            'rank' : 'place',
            'party' : 'user',
            'penalty' : 'penalty'
        }
    },

    parse_score_board: function(contest_id, result_table) {
        var page = this.page;
        var contest = CATS.App.contests[contest_id];
        if (contest == undefined)
            contest = this.add_contest({id: contest_id, name: 'NEERC ' + contest_id});

        var self = this;
        var problem_list = [];
        $(page).find('table[class != "wrapper"] tr').each(function () {
            var prob_num = 0;
            $(this).find('th.problem').each(function () {
                var prob = $.extend(new CATS.Model.Problem(), {
                    id: $(this).attr('title'),
                    name: $(this).attr('title'),
                    code: $(this).html()
                });
                CATS.App.add_object(prob);
                contest.add_object(prob);
                problem_list.push($(this).attr('title'));
            });

            var parse_row = false;
            var row = result_table.get_empty_score_board_row();
            $(this).find('td').each(function () {
                var key = $(this).attr('class');
                if (key !== undefined) {
                    parse_row = true;
                    if (self.aliases[key] !== undefined)
                        row[self.aliases[key]] = $(this).html();
                }
                else {
                    var runs = $(this).find('i');
                    runs = runs.length == 0 ? $(this).find('b') : runs;
                    var solved_time, solved = null, runs_cnt = -1;
                    if (runs.length > 0) {
                        solved = $(runs).html().indexOf('+') != -1;
                        var time = $(runs).find('s');
                        if (time.length > 0) {
                            time.find('br').remove();
                            solved_time = parseInt(time.html().split(':')[0]);
                            time.remove();
                        }
                        runs_cnt = $(runs).html();
                        if (runs_cnt == "-" || runs_cnt == "+")
                            runs_cnt = 0;
                        runs_cnt = Math.abs(parseInt(runs_cnt));
                    }
                    else if ($(this).html() == '.') {
                        solved = false;
                        runs_cnt = 0;
                    }

                    if (solved != null) {
                        var prob = $.extend(result_table.get_empty_problem_for_score_board_row(), {
                            problem: problem_list[prob_num++],
                            is_solved: solved,
                            runs_cnt: solved ? runs_cnt + 1 : runs_cnt
                        });

                        if (solved) {
                            prob.best_run_time = solved_time;
                            row.solved_cnt++;
                        }
                        row.problems.push(prob);
                    }
                }
            });
            if (parse_row) {
                row.place = parseInt(row.place);
                row.penalty = parseInt(row.penalty);

                var user = new CATS.Model.User();
                user.name = user.id = row.user;
                CATS.App.add_object(user);
                contest.add_object(user);

                result_table.score_board.push(row);
            }
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

    get_contests: function(callback) {
        var self = this;
        CATS.App.utils.cors_get_html(this.url + 'past/index.html', function (page) {
            var contests = [];
            $(page).find('td[class = "neercyear"]').find("a").each(function () {
                var id = $(this).html().match(/\d+/g)[0];
                if (id <= 2000)
                    return;
                var c = {id: id, name: $(this).html()};
                self.add_contest(c);
                contests.push(c.id);
            });
            callback(contests);
        })
    },

    get_contest: function(callback, contest_id) {
        var self = this;
        CATS.App.utils.cors_get_html(this.url + 'past/' + contest_id + '/standings.html', function (page) {
            callback(page);
        });
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
