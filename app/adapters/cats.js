CATS.Adapter.Cats = Classify({

    init : function(contest_id) {
        this.contest_id = contest_id[0];
        this.history = null;
        this.name = "cats";
        this.statuses = {
            10 : 'accepted',
            11 : 'wrong_answer',
            12 : 'presentation_error',
            13 : 'time_limit_exceeded',
            14 : 'runtime_error',
            15 : 'compilation_error',
            16 : 'security_violation',
            17 : 'memory_limit_exceeded',
            18 : 'ignore_submit',
            19 : 'idleness_limit_exceeded'
        }
    },

    parse_history: function(result_table, callback) {
        var self = this;
        var contest = null;
        self.get_contests(function () {
            contest = CATS.App.contests[self.contest_id];
            self.get_users(function (users) {
                contest.users = users;
                self.get_problems(function (problems) {
                    contest.problems = problems;
                    $.each(self.history.reverse(), function (k, row) {
                        //add run to contest and controller
                        var run = new CATS.Model.Run();
                        run.id = row.id;
                        run.problem = row.problem_id;
                        if (contest.scoring == "school")
                            run.points = row['points'];
                        run.user = row.team_id;
                        run.status = self.statuses[row['state']];
                        run.start_processing_time = row['time'].to_date();
                        CATS.App.add_object(run);
                        contest.add_object(run);
                    });
                    callback();
                });
            });
        }, self.contest_id);
    },

    add_contest: function(v) {
        var contest = new CATS.Model.Contest();
        contest.id = v['id'];
        contest.name = v['name'];
        contest.scoring = v['scoring'];
        contest.start_time = v["start_date"].to_date();
        contest.finish_time = v["finish_date"].to_date();
        CATS.App.add_object(contest);
        return contest;
    },

    url: 'http://imcs.dvfu.ru/cats/main.pl',

    get_contests: function(callback, contest_id) {
        var self = this;
        var s = contest_id != undefined ? 'id%3D' + self.contest_id : '';
        CATS.App.utils.jsonp_get(this.url + '?f=contests;filter=all;rows=1000000;search=' + s + ';json=parseJsonp', function (data) {
            var contests = [];
            $.each(data.contests, function (k, v) {
                self.add_contest(v);
                contests.push(v['id']);
            });
            callback(contests);
        });
    },

    add_user: function(v) {
        var user = new CATS.Model.User();
        user.id = v['account_id'];
        user.name = v['name'];
        user.role = v['virtual'] == 1 ? 'virtual' : v['role'];
        user.is_remote = v["remote"];
        if (v.affiliation) {
            user.affiliation.city = v.affiliation.city;
            user.affiliation.country = v.affiliation.country;
        }
        CATS.App.add_object(user);
        return user;
    },

    get_users: function(callback) {
        var self = this;
        CATS.App.utils.jsonp_get(this.url + '?f=users;sid=;rows=1000000;cid=' + self.contest_id + ';json=parseJsonp;', function (data) {
            var users = [];
            $.each(data, function (k, v) {
                self.add_user(v);
                users.push(v['account_id']);
            });
            callback(users);
        });
    },

    add_problem: function(v) {
        var problem = new CATS.Model.Problem();
        problem.id = v.id;
        problem.name = v.name;
        problem.code = v.code;
        problem.contest = v.contest_id;
        problem.language = v.language;
        problem.text_url = v.text_url;
        problem.package_url = v.package_url;
        problem.status = v.status;
        problem.max_points = v.max_points;
        problem.last_update_time = v.last_update_time;
        problem.limits = v.limits;
        CATS.App.add_object(problem);
        return problem;
    },

    get_problems: function(callback) {
        var self = this;
        CATS.App.utils.jsonp_get(this.url + '?f=problems;sid=;rows=1000000;sort=0;sort_dir=0;cid=' + self.contest_id + ';json=parseJsonp;', function (data) {
            var problems = [];
            $.each(data.problems, function (k, v) {
                self.add_problem(v);
                problems.push(v['id']);
            });
            callback(problems);
        });
    },

    get_history: function(callback) {
        var self = this;
        CATS.App.utils.jsonp_get(
            this.url + '?f=console_content;sid=;rows=1000000;cid=' + self.contest_id + ";json=parseJsonp;i_value=-1;",
            function(data) {
                callback(data);
            });
    },

    parse: function(result_table, callback) {
        var self = this;
        this.get_history(function (history) {
            self.history = history;
            self.parse_history(result_table, callback);
        });
    }
});
