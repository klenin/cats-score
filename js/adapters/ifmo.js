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
                prob_num++;
                var attempts = $(this).find("i");
                attempts = attempts.length == 0 ? $(this).find("b") : attempts
                if (attempts.length > 0) {
                    row['prob_' + prob_num + '_solved'] = $(attempts).html().indexOf("+") != -1;
                    var time = $(attempts).find("s");
                    if (time.length > 0) {
                        time.find("br").remove();
                        row['prob_' + prob_num + '_solved'] = time.html();
                        time.remove();
                    }
                    var attempts_cnt = $(attempts).html();
                    if (attempts_cnt.length == 1)
                        attempts_cnt = 1;
                    row['prob_' + prob_num + '_attempts'] = Math.abs(parseInt(attempts_cnt)) + 1;
                }
                else if ($(this).html() == ".") {
                    row['prob_' + prob_num + '_solved'] = false;
                    row['prob_' + prob_num + '_attempts'] = 0;
                }

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