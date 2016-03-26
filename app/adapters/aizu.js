CATS.Adapter.Aizu = Classify({

    init : function() {
        this.name = 'aizu';
        this.status_map = {
            0: 'compilation_error',
            1: 'wrong_answer',
            2: 'time_imit_exceeded',
            3: 'memory_limit_exceeded',
            4: 'accepted',
            6: 'write_limit_exceeded',
            7: 'runtime_error',
            8: 'presentation_error',
        };
    },

    add_contest: function(v) {
        var contest = CATS.Model.Contest();
        contest.id = v.find('id').text().trim();
        contest.name = v.find('title').text().trim();
        contest.scoring = 'acm';
        contest.start_time = new Date(1*v.find('start_date').text());
        contest.finish_time = new Date(1*v.find('end_date').text());
        CATS.App.add_object(contest);
        return contest;
    },

    add_problem: function(v) {
        var problem = CATS.Model.Problem();
        problem.id = problem.code = v.find('id').text().trim();
        problem.name = v.find('name').text().trim();
        CATS.App.add_object(problem);
        return problem;
    },

    parse_run: function(contest, v) {
        var run = new CATS.Model.Run();
        run.id = v.find('run_id').text().trim();
        run.problem = v.find('problem_id').text().trim();
        run.user = v.find('user_id').text().trim();
        if (!CATS.App.users[run.user]) {
            var user = new CATS.Model.User();
            user.name = user.id = run.user;
            CATS.App.add_object(user);
            contest.add_object(user);
        }
        run.contest = contest.id;
        run.status = this.status_map[v.find('status_code').text().trim()];
        run.start_processing_time = new Date(1*v.find('submission_date').text());
        CATS.App.add_object(run);
        contest.add_object(run);
    },

    url: 'http://judge.u-aizu.ac.jp/onlinejudge/webservice/',

    get_contests: function(callback) {
        var self = this;
        CATS.App.utils.proxy_get_xml(
            this.url + 'contest_list',
            function (data) {
                var contests = [];
                $.each(
                    $(data).find('contest_list').find('contest'),
                    function (k, v) {
                        contests.push(self.add_contest($(v)).id);
                    }
                );
                callback(contests);
            }
        );
    },

    parse_history: function (contest, callback) {
        var self = this;
        CATS.App.utils.proxy_get_xml(
            this.url + 'contest_problem?id=' + contest.id,
            function(data) {
                $.each(
                    $(data).find('contest_problem').find('problem'),
                    function (k, v) {
                        contest.add_object(self.add_problem($(v)));
                    }
                );
                CATS.App.utils.proxy_get_xml(
                    self.url + 'contest_status_log?id=' + contest.id,
                    function(data) {
                        $.each(
                            $(data).find('contest_status').find('status')
                                .get().reverse(),
                            function (k, v) {
                                self.parse_run(contest, $(v));
                            }
                        );
                        self.model = contest;
                        callback();
                    }
                );
            }
        );
    },

    parse: function(contest_id, result_table, callback) {
        var contest = CATS.App.contests[contest_id];
        if (!contest) {
            var self = this;
            CATS.App.utils.proxy_get_xml(
                this.url + 'contest_info?id=' + contest_id,
                function (data) {
                    contest = self.add_contest($(data).find('contest_info'));
                    //self.contests.push(contest);
                    self.parse_history(contest, callback);
                }
            );
        }
        else {
            this.parse_history(contest, callback);
        }
    }
});
