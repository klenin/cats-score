CATS.Model.Chart = Classify(CATS.Model.Entity, {
    init: function (table) {
        this.$$parent();
        this.type = "chart";
        this.table = table;
        this.series = [];
        this.series_params = [];
        this.chart_type = "line";
        this.contests_url_param = null;
        this.colors = [
            'black',
            'green',
            'blue',
            'red',
            'orange',
            'yellow',
            'cyan',
            'magenta',
            'gray',
            'violet'
        ];
        this.series_id_generator = 0;
        var self = this;
        this.group_by = {
            time: function (r) { return Math.ceil(r.minutes_since_start() / _.last(self.series_params).period); },
            status: function (r) { return self.statuses_arr.indexOf(r.status); },
        };

        this.group_by_xaxes_value = {
            time: function (idx) { return idx * _.last(self.series_params).period; },
            status: function (idx) { return idx; },
        };
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

    statuses_arr: [
        'accepted',
        'wrong_answer',
        'presentation_error',
        'time_limit_exceeded',
        'runtime_error',
        'compilation_error',
        'security_violation',
        'memory_limit_exceeded',
        'ignore_submit',
        'idleness_limit_exceeded',
    ],

    statuses_color: {
        accepted: 'green',
        wrong_answer: 'black',
        presentation_error: 'blue',
        time_limit_exceeded: 'red',
        runtime_error: 'orange',
        compilation_error: 'yellow',
        security_violation: 'cyan',
        memory_limit_exceeded: 'magenta',
        ignore_submit: 'gray',
        idleness_limit_exceeded: 'violet',
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
            this.chart_type = settings.chart_type;
            _.each(settings.params, function (v) { self.add_new_series(self.params_unpack(v)); });
        }
        return {chart_type: this.chart_type, params: _.map(this.series_params, function (v) { return self.params_pack(v); })};
    },

    parameter_yaxes: {
        run_cnt: 1,
        points: 2,
        place: 3,
    },

    parameter_xaxes: {
        time: 1,
        status: 2,
    },

    add_new_series: function(params) {
        this.series_params.push(params);
        this.series.push({
            label: params.parameter,
            data: this.aggregate(
                params.parameter === 'place' ? this.place_data(params) : this.simple_data(params), params),
            color: params.color != undefined ? params.color : this.colors[this.series.length % this.colors.length],
            xaxis: this.parameter_xaxes[params.group_by],
            yaxis: this.parameter_yaxes[params.parameter],
            id: ++this.series_id_generator,
        });
    },

    series_pie_format: function() {
        var pies = [];
        var self = this;
        var series_idx = 0;
        _.each(this.series, function (s) {
            var pie = [];
            _.each(s.data, function (data) {
                pie.push({label: self.series_params[series_idx].group_by == "status" ? self.statuses_arr[data[0]] : data[0], data: data[1]})
            });
            pies.push({
                id: s.id,
                data: pie
            });
            series_idx++;
        });

        return pies;
    },

    element_to_values: {
        run_cnt: function (runs) { return _.map(runs, function () { return 1; }); },
        points: function (runs) { return _.map(runs, function (r) { return r.points; }); },
        place: function (sb_rows) { return _.map(sb_rows, function (r) { return r.place; }); },
    },

    aggregate: function(chain, params) {
        var self = this;
        return chain.map(function(element, period_idx) {
            return [ self.group_by_xaxes_value[params.group_by](period_idx) ,
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
            groupBy(self.group_by[params.group_by]);
    },

    place_data: function(params) {
        var tbl = CATS.App.result_tables[this.table];
        var contest = CATS.App.contests[tbl.contest];
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

    delete_series: function(id) {
        id = _.findIndex(this.series, function (s) { return s.id === id; });
        this.series.splice(id, 1);
        this.series_params.splice(id, 1);
    },

    delete_all: function () {
        this.selected = null;
        this.series = [];
        this.series_params = [];
    },

    aggregation: {
        sum: function(arr) { return arr.reduce(function(pv, cv) { return pv + cv; }, 0); },
        avg: function(arr) { return arr.reduce(function(pv, cv) { return pv + cv; }, 0) / arr.length; },
        min: _.min,
        max: _.max,
    },

    gen_submittions_per_problem_params: function () {
        var params = [];
        var contest = this.get_contest();
        _.each(contest.problems, function (id) {
            params.push({"period":10,"parameter":"run_cnt","aggregation":"sum","group_by":"status","problems":[id],"user":".*?","affiliation":".*?"});
        });
        return {"chart": { params: params, chart_type: 'pie'}};
    }
});
