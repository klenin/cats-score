CATS.Controller = Classify({
    init: function () {
        //other
        this.adapters = {};
        this.rules = {};
        this.utils = null;
        this.contest_filters = { name: null }; // TODO: Make this per-adapter?
        //models
        this.users = {};
        this.problems = {};
        this.prizes = {};
        this.contests = {};
        this.chats = {};
        this.runs = {};
        this.compilers = {};
        this.result_tables = {};
        this.charts = {};
        this.last_id = 0;

        this.utils = new CATS.Utils();
    },

    add_object: function(obj) {
        this[obj.type + 's'][obj.id] = obj;
    },

    get_new_id: function() {
        return 'id_' + this.last_id++;
    },

    get_result_table: function(contest_list) {
        for (var k in this.result_tables) {
            if (this.result_tables[k].contests.equals(contest_list))
                return this.result_tables[k];
        }
        return null;
    },

    have_result_table: function(contest_list) {
        return this.get_result_table(contest_list) != null;
    },

    register_adapter: function(adapter) {
        this.adapters[adapter.name] = adapter;
    },

    register_rule: function(rule) {
        this.rules[rule.name] = rule;
    },

    adapter_process_rank_table: function(callback, contest_id, settings) {
        var contest_list = (contest_id.indexOf(',') != -1) ? contest_id.split(',') : [contest_id];

        var cont_list = [];
        for(var i = 0; i < contest_list.length; ++i)
            cont_list.push(contest_list[i].split(':')[1]);

        if (this.have_result_table(cont_list) > 0) {
            var result_table = this.get_result_table(cont_list);
            if (settings != null && settings.chart != undefined)
                CATS.App.charts[result_table.chart].settings(settings.chart);
            callback({chart: result_table.chart, contest: result_table.contest, table: result_table.id});
            return;
        }


        var self = this;
        var promises = $.map(contest_list, function(con){
            var d = $.Deferred();
            var cont_adapter = con.split(':')[0];
            var cont_id = con.split(':')[1];
            var result_table = new CATS.Model.Results_table();
            result_table.contests.push(cont_id);
            self.adapters[cont_adapter].parse(cont_id, result_table, function () {
                var contest = CATS.App.contests[cont_id];
                result_table.contest = cont_id;
                result_table.contests = [cont_id];
                CATS.App.rules[contest.scoring].process(contest, result_table);
                d.resolve();
            });
            return d.promise();
        });

        $.when.apply($, promises).done(function(){
            var result_table = new CATS.Model.Results_table();
            result_table.contests = cont_list;
            var united_contest = new CATS.Model.Contest();
            united_contest.scoring = "acm";
            united_contest.name = "";
            for (var i = 0; i < cont_list.length; ++i) {
                var c = CATS.App.contests[cont_list[i]];
                if (c.scoring == "school") //суммируются турниры разных правил, выбирем школьные
                    united_contest.scoring = "school";
                united_contest.runs = _.uniq(united_contest.runs.concat(c.runs));
                united_contest.sort_runs();
                united_contest.problems = united_contest.problems.concat(c.problems);
                united_contest.users = _.uniq(united_contest.users.concat(c.users));
                united_contest.name += c.name + ", ";
                if (united_contest.start_time == null) {
                    united_contest.start_time = c.start_time;
                    united_contest.finish_time = c.finish_time;
                }
                else {
                    united_contest.start_time = Math.min(united_contest.start_time, c.start_time);
                    united_contest.finish_time = Math.max(united_contest.finish_time, c.finish_time);
                }
            }
            CATS.App.add_object(united_contest);
            result_table.scoring = united_contest.scoring;
            result_table.contest = united_contest.id;
            if (settings != null && settings.table != undefined)
                result_table.filters = settings.table;
            CATS.App.rules[united_contest.scoring].process(united_contest, result_table);
            CATS.App.add_object(result_table);
            var chart = new CATS.Model.Chart(result_table.id);
            chart.contests_url_param = contest_list;
            if (settings != null && settings.chart != undefined)
                chart.settings(settings.chart);
            CATS.App.add_object(chart);
            result_table.chart = chart.id;
            callback({chart: chart.id, contest: united_contest.id, table: result_table.id});
        });
    },

    contest_filter: function (contest_id) {
        var name = CATS.App.contest_filters.name;
        return name === null || CATS.App.contests[contest_id].name.match(new RegExp(name));
    },

    adapter_filter_contests_list: function(adapter_name, callback) {
        var self = this;
        var cc = this.adapters[adapter_name].cached_contests;
        if (cc === undefined)
            this.adapter_process_contests_list(adapter_name, callback);
        else
            callback({ contests: _.filter(cc, self.contest_filter) });
    },

    adapter_process_contests_list: function(adapter_name, callback, settings) {
        var self = this;
        var adapter = this.adapters[adapter_name];
        if (settings != null && settings.contests != undefined)
            CATS.App.contest_filters = settings.contests;
        adapter.get_contests(function (contests) {
            adapter.cached_contests = contests;
            callback({ contests: _.filter(contests, self.contest_filter) });
        });
    },

    get_problem_by_code: function(code) {
        var prob = null;
        $.each(this.problems, function (k, v) {
            if (v['code'] == code)
                prob = v;
        });
        return prob;
    }
});