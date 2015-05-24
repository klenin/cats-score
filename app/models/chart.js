CATS.Model.Chart = Classify(CATS.Model.Entity, {
    init: function (table) {
        this.$$parent();
        this.type = "chart";
        this.table = table;
        this.series = [];
        this.series_colors = [];
        this.colors = [
            'green',
            'black',
            'blue',
            'red',
            'orange',
            'yellow',
            'cyan',
            'magenta',
            'gray',
            'violet',
        ];
    },

    add_new_series: function(params) {
        var tbl = CATS.App.result_tables[this.table];
        var c = CATS.App.contests[tbl.contest];
        var start_time = CATS.App.contests[tbl.contests[0]].start_time;
        var next_time = CATS.App.utils.add_time(start_time, params.period);
        var new_series = [];
        this['add_' + params.parameter + "_series"](tbl, c, start_time, next_time, new_series, params);
        this.series.push({label: params.parameter, data: new_series, xaxis: 1, yaxis: this.series.length + 1});
        this.series_colors.push(params.color != undefined ? params.color : this.colors[this.series_colors.length % this.colors.length]);
    },

    add_run_cnt_series: function(tbl, c, start_time, next_time, new_series, params) {
        var runs = c.runs;
        var targets = [];
        for(var i = 0; i < runs.length; ++i) {
            var r = CATS.App.runs[runs[i]];
            var user = CATS.App.users[r.user];
            if (
                params.statuses.indexOf(r.status) != -1 &&
                params.problems.indexOf(r.problem) != -1 &&
                user.some_affiliation().match(new RegExp(params.affiliation)) &&
                user.name.match(new RegExp(params.user))
            )
                targets.push(1);

            if (CATS.App.utils.get_time_diff(r.start_processing_time, next_time) < 0) {
                new_series.push([(new_series.length + 1) * params.period, this["aggregation_" + params.aggregation](targets)]);
                next_time = CATS.App.utils.add_time(next_time, params.period);
            }
        }
        new_series.push([(new_series.length + 1) * params.period, this["aggregation_" + params.aggregation](targets)]);
    },

    add_points_series: function(tbl, c, start_time, next_time, new_series, params) {
        var runs = c.runs;
        var targets = [];
        for(var i = 0; i < runs.length; ++i) {
            var r = CATS.App.runs[runs[i]];
            var user = CATS.App.users[r.user];
            if (user.name.match(new RegExp(params.user)))
                targets.push(r.points);

            if (CATS.App.utils.get_time_diff(r.start_processing_time, next_time) < 0) {
                new_series.push([(new_series.length + 1) * params.period, this["aggregation_" + params.aggregation](targets)]);
                next_time = CATS.App.utils.add_time(next_time, params.period);
            }
        }
        new_series.push([(new_series.length + 1) * params.period, this["aggregation_" + params.aggregation](targets)]);
    },

    add_place_series: function(tbl, c, start_time, next_time, new_series, params) {
        var next_period = params.period;
        var duration = CATS.App.contests[tbl.contests[0]].compute_duration_minutes();
        while(next_period < duration) {
            var targets = [];
            tbl.clean_score_board();
            $.extend(tbl.filters, {duration: {minutes: next_period, type: "history"}});
            var contest = CATS.App.contests[tbl.contest];
            CATS.App.rules[contest.scoring].process(contest, tbl);
            var sb = tbl.score_board;
            for (var j = 0; j < sb.length; ++j) {
                var r = sb[j];
                var user = CATS.App.users[r.user];
                if (user.some_affiliation().match(new RegExp(params.affiliation)))
                    targets.push(r.place);
            }
            next_period += params.period;
            new_series.push([(new_series.length + 1) * params.period, this["aggregation_" + params.aggregation](targets)]);
        }
    },

    delete_series: function(idx) {
        this.series.splice(idx, 1);
        this.series_colors.splice(idx, 1);
    },

    aggregation_sum: function(arr) {
        return arr.reduce(function(pv, cv) { return pv + cv; }, 0);
    },

    aggregation_avg: function(arr) {
        return arr.reduce(function(pv, cv) { return pv + cv; }, 0) / arr.length;
    },

    aggregation_min: function(arr) {
        return Math.min.apply(null, arr);
    },

    aggregation_max: function(arr) {
        return Math.max.apply(null, arr);
    },
});