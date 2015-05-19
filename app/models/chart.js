CATS.Model.Chart = Classify(CATS.Model.Entity, {
    init: function (table) {
        this.$$parent();
        this.type = "chart";
        this.table = table;
        this.series = [];
    },

    add_new_series: function(params) {
        this['add_' + params.parameter + "_series"](params);
    },

    add_run_cnt_series: function(params) {
        var tbl = CATS.App.result_tables[this.table];
        var c = CATS.App.contests[tbl.contest];
        var runs = c.runs;
        var start_time = CATS.App.contests[tbl.contests[0]].start_time;
        var next_time = CATS.App.utils.add_time(start_time, params.period);
        var counter = 0;
        var new_series = [];
        for(var i = 0; i < runs.length; ++i) {
            var r = CATS.App.runs[runs[i]];
            var user = CATS.App.users[r.user];
            if (
                params.statuses.indexOf(r.status) != -1 &&
                params.problems.indexOf(r.problem) != -1 &&
                user.some_affiliation().match(new RegExp(params.affiliation)) &&
                user.name.match(new RegExp(params.user))
            ) {
                counter++;
            }
            if (CATS.App.utils.get_time_diff(r.start_processing_time, next_time) < 0) {
                new_series.push([(new_series.length + 1) * params.period, counter]);
                next_time = CATS.App.utils.add_time(next_time, params.period);
            }
        }
        new_series.push([(new_series.length + 1) * params.period, counter]);
        this.series.push({data: new_series, xaxis: 1, yaxis: this.series.length + 1});
    }
});