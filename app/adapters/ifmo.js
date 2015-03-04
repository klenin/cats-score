CATS.Adapter.Ifmo = Classify({
    init : function(contest_id, page) {
        if (page != undefined)
            this.page = page;

        this.contest_id = contest_id[0];

        this.name = "ifmo";
        this.aliases = {
            'rankl' : 'place',
            'party' : 'user',
            'penalty' : 'penalty'
        }
    },

    parse_score_board: function(result_table) {
        var page = this.page;
        var contest = CATS.App.contests[this.contest_id];
        if (contest == undefined)
            contest = this.add_contest();

        var self = this;
        var problem_list = [];
        $(page).find('table[class != "wrapper"]').find("tr").each(function () {
            var prob_num = 0;
            $(this).find("th.problem").each(function () {
                var prob = new CATS.Model.Problem();
                prob.name = prob.id = $(this).attr("title");
                prob.code = $(this).html();
                CATS.App.add_object(prob);
                contest.add_object(prob);
                problem_list.push($(this).attr("title"));
            });

            var parse_row = false;
            var row = result_table.get_empty_score_board_row();
            $(this).find("td").each(function () {
                var key = $(this).attr('class');
                if (key !== undefined) {
                    parse_row = true;
                    if (self.aliases[key] != undefined)
                        row[self.aliases[key]] = $(this).html();
                } else {
                    var runs = $(this).find("i");
                    runs = runs.length == 0 ? $(this).find("b") : runs;
                    var solved = -1, runs_cnt = -1;
                    if (runs.length > 0) {

                        solved = $(runs).html().indexOf("+") != -1;
                        var time = $(runs).find("s");
                        if (time.length > 0) {
                            time.find("br").remove();
                            solved = parseInt(time.html().split(":")[0]);
                            time.remove();
                        }
                        runs_cnt = $(runs).html();
                        if (runs_cnt.length == 1)
                            runs_cnt = 0;
                        runs_cnt = Math.abs(parseInt(runs_cnt)) + 1;
                    }
                    else if ($(this).html() == ".") {
                        solved = false;
                        runs_cnt = 0;
                    }

                    if (solved != -1) {
                        var prob = result_table.get_empty_problem_for_score_board_row();
                        prob['problem'] = problem_list[prob_num++];
                        prob['is_solved'] = solved != false;
                        if (prob['is_solved']) {
                            prob['best_run_time'] = solved;
                            row['solved_cnt']++;
                        }
                        prob['runs_cnt'] = runs_cnt;

                        row['problems'].push(prob);
                    }
                }
            });
            if (parse_row) {
                row['place'] = parseInt(row['place']);
                row['penalty'] = parseInt(row['penalty']);

                var user = new CATS.Model.User();
                user.name = user.id = row['user'];
                CATS.App.add_object(user);
                contest.add_object(user);

                result_table.score_board.push(row);
            }
        });
    },

    add_contest: function(v) {
        var contest = CATS.Model.Contest(), contests = [];
        contest.id = "ifmo_contest";
        contest.name = "ifmo_contest";
        contest.scoring = "acm";
        contest.start_time = new Date();
        CATS.App.add_object(contest);
        return contest;
    },

    get_contests: function(callback) {
        this.add_contest()
        callback(["ifmo_contest"]);
    },

    parse: function(result_table, callback) {
        this.parse_score_board(result_table);
        callback();
    }
});
