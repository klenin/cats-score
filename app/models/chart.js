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
        this.filter = 'new';
        var self = this;
        this.group_by = {
            // NOTE: Don't like this ID's manipulation, think how to improve.
            time: function (r) {
                var selected = self.selected;
                    id = _.findIndex(self.series, function (s) { return s.id == selected; });
                return Math.ceil(r.minutes_since_start() / (self.series_params[id] || _.last(self.series_params)).period);
            },
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
        if (result.statuses && result.statuses.length === _.keys(this.statuses).length)
            delete result.statuses;
        if (result.problems && result.problems.length === this.get_contest().problems.length)
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
        this.series.push(this.get_series_object(params, 'new'));
    },

    change_series: function (param) {
        var that = this,
            idx = _.findIndex(this.series, function (s) { return s.id == that.selected; }),
            params = this.series_params[idx];

        _.extendOwn(params, param);
        _.extendOwn(this.series[idx], this.get_series_object(params));
    },

    change_all_series: function (param) {
        var that = this;
        _.each(this.series_params, function (obj, idx) {
            _.extendOwn(obj, param);
            _.extendOwn(that.series[idx], that.get_series_object(obj));
        });
    },

    get_series_object: function (params, type) {
        var object = {
            label: params.parameter,
            data: this.aggregate(
                params.parameter === 'place' ? this.place_data(params) : this.simple_data(params), params),
            color: params.color != undefined ? params.color : this.colors[this.series.length % this.colors.length],
            xaxis: this.parameter_xaxes[params.group_by],
            yaxis: this.parameter_yaxes[params.parameter]
        }
        if (type == 'new') {
            object.id = ++this.series_id_generator;
        }
        return object;
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

    delete_series: function (id) {
        idx = _.findIndex(this.series, function (s) { return s.id === id; });
        this.series.splice(idx, 1);
        this.series_params.splice(idx, 1);
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

    get_filters: function () {
        var filters = {},
            params = ['user', 'affiliation', 'problems', 'statuses'];
        // TODO: Stop iterating, if 'Various options' is set. Tried removing from params - got ghost undefined element.
        _.each(this.series_params, function (p) {
            _.each(params, function(key) {
                filters[key] = (filters[key] == null || _.isEqual(filters[key], p[key])) ?  p[key] : 'Various options';
            });
        });
        return filters;
    },

    gen_submittions_per_problem_params: function () {
        var params = [];
        var contest = this.get_contest();
        _.each(contest.problems, function (id) {
            params.push({"period":10,"parameter":"run_cnt","aggregation":"sum","group_by":"status","problems":[id],"user":"","affiliation":""});
        });
        return {"chart": { params: params, chart_type: 'pie'}};
    },

    init_plot: function () {
        if (this.chart_type == 'line') {
            this.init_line_chart();
        } else {
            this.init_pie_chart();
        }

        if (!$('.container').addClass('non-responsive-container')) {
            $('.container').addClass('non-responsive-container');
            $('.col-md-12').removeClass('col-md-12').addClass('col-xs-12');
            $('.col-md-3').removeClass('col-md-3').addClass('col-xs-3');
        }
    },

    init_line_chart: function () {
        var statuses = [];
        _.each(this.statuses_arr, function (status, i) {
            statuses.push([i, status]);
        });

        this.plotObj = $.plot('#plot', this.series, {
            xaxes: [
                { position: 'bottom', axisLabel: 'time' },
                { position: 'bottom', ticks: statuses, axisLabel: 'statuses' }
            ],
            yaxes: [
                { position: 'left', axisLabel: 'pieces' },
                { position: 'left', axisLabel: 'points' },
                { position: 'left', axisLabel: 'place' },
            ],
            legend: {
                container: $('#legend'),
                labelFormatter: function (label, series) {
                    var text = '<a class = label-line data-series="' + series.id + '">' + label + '</a>',
                        delete_btn = '<button type="button" class="close delete-line delete-series" data-series="' + series.id + '" data-dismiss="modal" aria-label="Close"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>';
                    return text + delete_btn;
                }
            },
            grid: {
                hoverable: true,
                clickable: true
            },
            series : {
                lines: { show: true }, points: { show: true }
            }
        });
    },

    init_pie_chart: function () {
        var series = this.series_pie_format();

        for (var i = 0; i < series.length; ++i) {
            var id = series[i].id;

            if (series[i].data.length == 0) {
                break;
            }

            $.plot('#plot_' + id, series[i].data, {
                series: {
                    pie: { show: true }
                },
                grid: {
                    hoverable: true,
                    clickable: true
                },
                legend: {
                    container: $('#legend_' + id)
                }
            });

            var col = $('#plot_' + id).parent().parent();

            col.append('<button type="button" class="close delete-pie delete-series" data-series="' + id + '" data-dismiss="modal" aria-label="Close"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>');
        }
    },

    select_plot_line: function (index) {
        var series = $.map(this.plotObj.getData(), function (series, idx) {
            if (idx === index) {
                series.shadowSize = 10;
            } else {
                series.shadowSize = 0;
            }
            return series;
        });

        this.plotObj.setData(series);
        this.plotObj.draw();
        this.selected = this.series[index].id;
    }
});
