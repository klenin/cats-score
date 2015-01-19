function Ifmo_adapter(page, model) {
    this.page = page;
    this.model = model

    this.aliaces = {
        'rankl' : 'place',
        'party' : 'team_name',
        'penalty' : 'penalty'
    }
}



Ifmo_adapter.prototype.parse_score_board = function() {
    var page = this.page;
    var self = this;
    $(page).find('table[class != "wrapper"]').find("tr").each(function () {
        var row = {}
        var prob_num = 0;
        $(this).find("th.problem").each(function () {
            self.model.problems.push($(this).attr("title"));
        });
        $(this).find("td").each(function () {
            var key = $(this).attr('class');
            if (key !== undefined)
                row[self.aliaces[key]] = $(this).html();
            else {
                var runs = $(this).find("i");
                runs = runs.length == 0 ? $(this).find("b") : runs;
                var solved = -1, runs_cnt = -1;
                if (runs.length > 0) {

                    solved = $(runs).html().indexOf("+") != -1;
                    var time = $(runs).find("s");
                    if (time.length > 0) {
                        time.find("br").remove();
                        solved = time.html();
                        time.remove();
                    }
                    runs_cnt = $(runs).html();
                    if (runs_cnt.length == 1)
                        runs_cnt = 1;
                    runs_cnt = Math.abs(parseInt(runs_cnt)) + 1;
                }
                else if ($(this).html() == ".") {
                    solved = false;
                    runs_cnt = 0;
                }

                if (runs_cnt >= 0) {
                    row[prob_num] = {'s' : solved, 'r' : runs_cnt}
                }
                prob_num++;
            }
        });
        if (Object.keys(row).length > 0)
            self.model.score_board.push(row);
    });
}

Ifmo_adapter.prototype.get_model = function() {
    if (this.model.score_board.length == 0)
        this.parse_score_board();

    return this.model;
}