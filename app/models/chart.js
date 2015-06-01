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

    parameter_yaxes: {
        run_cnt: 1,
        points: 2,
        place: 3,
    },

    add_new_series: function(params) {
        this.series_params.push(params);
        this.series.push({
            label: params.parameter,
            data: this.aggregate(
                params.parameter === 'place' ? this.place_data(params) : this.simple_data(params), params),
            color: params.color != undefined ? params.color : this.colors[this.series.length % this.colors.length],
            xaxis: 1,
            yaxis: this.parameter_yaxes[params.parameter],
            id: ++this.series_id_generator,
        });
    },

    element_to_values: {
        run_cnt: function (runs) { return _.map(runs, function () { return 1; }); },
        points: function (runs) { return _.map(runs, function (r) { return r.points; }); },
        place: function (sb_rows) { return _.map(sb_rows, function (r) { return r.place; }); },
    },

    aggregate: function(chain, params) {
        var self = this;
        return chain.map(function(element, period_idx) {
            return [ period_idx * params.period,
                self.aggregation[params.aggregation](self.element_to_values[params.parameter](element)) ];
        }).value();
    },

    simple_data: function(params) {
        var self = this;
        var statuses = _.countBy(params.statuses, function (s) { return self.statuses[s]; });
        var problems = _.countBy(params.problems, _.identity);
        var affiliation_regexp = new RegExp(params.affiliation);
        var user_regexp = new RegExp(params.user);
        var contest = this.get_contest();
        return _.chain(contest.runs).
            map(function (rid) { return CATS.App.runs[rid]; }).
            filter(function (r) {
                var user = CATS.App.users[r.user];
                return (
                    r.start_processing_time <= contest.finish_time &&
                    statuses[r.status] && problems[r.problem] &&
                    affiliation_regexp.test(user.some_affiliation()) && user_regexp.test(user.name));
            }).
            groupBy(function (r) { return Math.ceil(r.minutes_since_start() / params.period); });
    },

    place_data: function(params) {
        var tbl = CATS.App.result_tables[this.table];
        var contest = CATS.App.contests[tbl.contest];
        var next_period = params.period;
        var duration = contest.compute_duration_minutes() + 1;

        var affiliation_regexp = new RegExp(params.affiliation);
        var user_regexp = new RegExp(params.user);

        var result = [];
        for(var period_idx = 1; period_idx * params.period <= duration; ++period_idx) {
            tbl.clean_score_board();
            tbl.filters.duration = { minutes: period_idx * params.period, type: 'history' };
            CATS.App.rules[contest.scoring].process(contest, tbl);
            result[period_idx] = _.filter(tbl.score_board, function (row) {
                var user = CATS.App.users[row.user];
                return affiliation_regexp.test(user.some_affiliation()) && user_regexp.test(user.name);
            });
        }
        return _.chain(result);
    },

    delete_series: function(seriesId) {
        var idx = _.findIndex(this.series, function (s) { return s.id === seriesId; });
        this.series.splice(idx, 1);
        this.series_params.splice(idx, 1);
    },

    aggregation: {
        sum: function(arr) { return arr.reduce(function(pv, cv) { return pv + cv; }, 0); },
        avg: function(arr) { return arr.reduce(function(pv, cv) { return pv + cv; }, 0) / arr.length; },
        min: _.min,
        max: _.max,
    },
});
