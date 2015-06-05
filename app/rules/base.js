CATS.Rule.Base = Classify({

    compute_table: function (result_table, contest) {
        var d = result_table.filters.duration;
        var runs = _.map(contest.runs, function (r) { return CATS.App.runs[r]; });
        this.compute_table_add_runs(result_table, contest,
            d.type === 'history' && d.minutes != null ?
                _.filter(runs, function (r) { return r.minutes_since_start() <= d.minutes }) : runs);
    },

    process: function (contest, result_table) {
        if (contest.runs.length == 0 && result_table.score_board.length > 0)
            this.compute_history(result_table, contest);
        else if (contest.runs.length > 0 && result_table.score_board.length == 0) 
            this.compute_table(result_table, contest);
    }
});
