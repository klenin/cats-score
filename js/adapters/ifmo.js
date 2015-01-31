function Ifmo_adapter(page, model) {
    this.page = page;
    this.model = model;

    this.aliases = {
        'rankl' : 'place',
        'party' : 'team_name',
        'penalty' : 'penalty'
    }
}

Ifmo_adapter.prototype.parse_score_board = function() {
    var page = this.page;
    var self = this;
    $(page).find('table[class != "wrapper"]').find("tr").each(function () {
        var prob_num = 0;

        $(this).find("th.problem").each(function () {
            self.model.contest_info.problems.push($(this).attr("title"));

        });

        var parse_row = false;
        var row = self.model.table.get_empty_score_board_row();
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

                if (runs_cnt >= 0) {
                    row['problems'][prob_num] = {'solve_time' : solved, 'runs_cnt' : runs_cnt}
                }
                prob_num++;
            }
        });
        if (parse_row) {
            row['place'] = parseInt(row['place']);
            row['penalty'] = parseInt(row['penalty']);
            self.model.table.score_board.push(row);
        }
    });

    var r = new Acm_rules(self.model);
    r.compute_history();
}

Ifmo_adapter.prototype.parse = function() {
    if (this.model.table.score_board.length == 0)
        this.parse_score_board();

    return this.model;
}