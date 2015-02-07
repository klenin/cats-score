CATS.Adapter.Ifmo = Classify({
    init : function(page) {
        this.page = page;
        this.name = "ifmo";
        this.aliases = {
            'rankl' : 'place',
            'party' : 'user',
            'penalty' : 'penalty'
        }
    },

    parse_score_board: function(contest, result_table) {
        var page = this.page;
        contest.name = $(page).find("h2").html();
        contest.scoring = "acm";
        var self = this;
        var problem_list = []
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

                    var prob = result_table.get_empty_problem_for_score_board_row();
                    prob['problem'] = problem_list[prob_num++];
                    prob['is_solved'] = solved != false;
                    if (prob['is_solved'])
                        prob['best_run_time'] = solved;
                    prob['runs_cnt'] = runs_cnt;

                    if (runs_cnt >= 0) {
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

    parse: function(contest, result_table) {
        this.parse_score_board(contest, result_table);
    }
});
