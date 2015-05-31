CATS.Model.Chart = Classify(CATS.Model.Entity, {
    init: function (table) {
        this.$$parent();
        this.type = "chart";
        this.table = table;
        this.series = [];
        this.series_params = [];
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
        this.series_id_generator = 0;
    },

    statuses: {
        OK: 'accepted',
        WA: 'wrong_answer',
        PE: 'presentation_error',
        TL: 'time_limit_exceeded',
        RE: 'runtime_error',
        CE: 'compilation_error',
        SV: 'security_violation',
        ML: 'memory_limit_exceeded',
        IS: 'ignore_submit',
        IL: 'idleness_limit_exceeded',
    },

    get_contest: function () {
        var t = CATS.App.result_tables[this.table];
        return CATS.App.contests[t.contest];
    },

    params_pack: function (p) {
        var result = _.clone(p);
        if (result.statuses.length === _.keys(this.statuses).length)
            delete result.statuses;
        if (result.problems.length === this.get_contest().problems.length)
            delete result.problems;
        return result;
    },

    params_unpack: function (p) {
        var result = _.clone(p);
        result.statuses = p.statuses ? p.statuses : _.keys(this.statuses);
        result.problems = p.problems ? p.problems : this.get_contest().problems;
        return result;
    },

    settings: function(settings) {
        var self = this;
        if (settings != undefined) {
            this.series = [];
            this.series_params = [];
            this.series = [];
            _.each(settings, function (v) { self.add_new_series(self.params_unpack(v)); });
        }
        return _.map(this.series_params, function (v) { return self.params_pack(v); });
    },

    add_new_series: function(params) {
        this.series_params.push(params);
        var tbl = CATS.App.result_tables[this.table];
        var c = CATS.App.contests[tbl.contest];
        var start_time = CATS.App.contests[tbl.contests[0]].start_time;
        var next_time = CATS.App.utils.add_time(start_time, params.period);
        var new_series = [];
        this['add_' + params.parameter + "_series"](tbl, c, start_time, next_time, new_series, params);
        this.series.push({
            label: params.parameter,
            data: new_series,
            color: params.color != undefined ? params.color : this.colors[this.series.length % this.colors.length],
            xaxis: 1,
            yaxis: this.series.length + 1,
            id: ++this.series_id_generator,
        });
    },

    add_run_cnt_series: function(tbl, c, start_time, next_time, new_series, params) {
        var runs = c.runs;
        var targets = [];
        var self = this;
        var statuses = _.countBy(params.statuses, function (s) { return self.statuses[s]; });
        var problems = _.countBy(params.problems, _.identity);
        for(var i = 0; i < runs.length; ++i) {
            var r = CATS.App.runs[runs[i]];
            var user = CATS.App.users[r.user];
            if (
                statuses[r.status] &&
                problems[r.problem] &&
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

    delete_series: function(seriesId) {
        var idx = _.findIndex(this.series, function (s) { return s.id === seriesId; });
        this.series.splice(idx, 1);
        this.series_params.splice(idx, 1);
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
