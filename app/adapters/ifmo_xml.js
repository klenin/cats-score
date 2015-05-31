CATS.Adapter.Ifmo_xml = Classify(CATS.Adapter.Ifmo, {
    init : function(page) {
        this.$$parent();

        if (page != undefined)
            this.page = page;

        this.name = 'ifmo_xml';
    },

    parse_history : function(contest_id, result_table) {
        var self = this;
        var page = this.page;

        var contest = CATS.App.contests[contest_id];
        if (contest == undefined)
            contest = this.add_contest({id: contest_id, name: 'NEERC ' + contest_id});

        $(page).children('standings').children('contest').each(function () {
            var row = {};
            $(this).children('challenge').children('problem').each(function() {
                var prob = new CATS.Model.Problem();
                prob.name = prob.id = $(this).attr('name');
                prob.code = $(this).attr('alias');
                CATS.App.add_object(prob);
                contest.add_object(prob);
            });
            $(this).children('session').each(function() {
                var user = new CATS.Model.User();
                user.name = $(this).attr('party');
                user.id = $(this).attr('id');
                CATS.App.add_object(user);
                contest.add_object(user);

                $(this).children('problem').each(function() {
                    var problem_id = CATS.App.get_problem_by_code($(this).attr('alias')).id;
                    $(this).children('run').each(function() {
                        var run = new CATS.Model.Run();
                        run.problem = problem_id;
                        run.user = user.id;
                        run.contest = contest_id;
                        run.status = $(this).attr('accepted') === 'yes' ? 'accepted' : 'wrong_answer';
                        run.start_processing_time = CATS.App.utils.add_time(contest.start_time, Math.floor($(this).attr('time') / 60000));
                        CATS.App.add_object(run);
                        contest.add_object(run);
                    });
                });
            });

        });
    },

    minimal_year: 2011,

    get_contest: function(callback, contest_id) {
        CATS.App.utils.cors_get_xml(this.url + 'past/' + contest_id + '/northern/north-' + contest_id + '-standings.xml', callback);
    },

    parse: function(contest_id, result_table, callback) {
        var self = this;
        this.get_contest(function (page) {
            self.page = page;
            self.parse_history(contest_id, result_table);
            callback();
        }, contest_id);
    }
});
