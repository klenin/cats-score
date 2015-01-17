function Ifmo_adapter(page) {
    this.page = page;
    this.tbl_data = [];
}

Ifmo_adapter.prototype.parse = function() {
    var page = this.page;
    var data = [];
    $(page).find('table[class != "wrapper"]').find("tr").each(function () {
        var row = {}
        var prob_num = 0;
        $(this).find("td").each(function () {
            var key = $(this).attr('class');
            if (key !== undefined)
                row[key] = $(this).html();
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
            data.push(row);
    });
    this.tbl_data = data;
}

Ifmo_adapter.prototype.get_data_for_table_model = function() {
    if (this.tbl_data.length == 0)
        this.parse();

    return this.tbl_data;
}