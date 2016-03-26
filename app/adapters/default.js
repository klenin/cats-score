CATS.Adapter.Default = Classify({

    init : function() {
        this.contest_data = null;
        this.name = "default";
    },

    parse_history: function(contest_id, result_table) {
        var cd = this.contest_data;
        var version = CATS.Model.Version();
        version.id = cd[0].id;
        $.each(cd, function (k, v) {
            if (v['type'] == "version")
                return 1;

            var new_model = new CATS.Model[v['type'].capitalize()]();
            $.extend(new_model, v);
            new_model.version = version;

            if (new_model.type == "contest") {
                new_model.start_time = new Date(new_model.start_time);
                new_model.finish_time = new Date(new_model.finish_time);
            }

            if (new_model.type == "run")
                new_model.start_processing_time = new Date(
                    new_model.start_processing_time
                );

            CATS.App.add_object(new_model);
        });
    },

    add_contest: function(c, v) {
        var contest = CATS.Model.Contest();
        $.extend(contest, c);
        contest.version = v;
        contest.start_time = new Date(contest.start_time);
        contest.finish_time = new Date(contest.finish_time);
        CATS.App.add_object(contest);
        return contest;
    },

    get_contests: function(callback) {
        var self = this;
        CATS.App.utils.json_get(
            "app/tests/default_get_contests.json",
            function(data) {
                var contests = [];
                var version = CATS.Model.Version();
                version.id = data[0].id;
                $.each(data, function (k, v) {
                    if (v["type"] == "version")
                        return 1;
                    self.add_contest(v, version);
                    contests.push(v['id']);
                });
                callback(contests);
            }
        );
    },

    get_contest: function(callback, contest_id) {
        var self = this;
        CATS.App.utils.json_get(
            "app/tests/default_get_contest_id_" +
            contest_id +
            ".json",
            function(data) {
                callback(data);
            });
    },

    parse: function(contest_id, result_table, callback) {
        var self = this;
        this.get_contest(function(obj) {
            self.contest_data = obj;
            self.parse_history(contest_id, result_table);
            callback();
        }, contest_id);
    }
});
