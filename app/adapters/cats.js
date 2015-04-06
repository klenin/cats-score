CATS.Adapter.Cats = Classify({

    init : function(contest_id, page) {
        if (page != undefined)
            this.page = page;
        this.contest_id = contest_id[0];
        this.name = "cats";
        this.model = null;
        this.aliases = {
            'problem_title' : 'problem_title',
            'failed_test' : 'failed_test',
            'submit_time' : 'submit_time',
            'team_name' : 'team_name',
            'team_id' : 'team_id',
            'is_remote' : 'is_remote',
            'state' : 'state',
            'is_ooc' : 'is_ooc',
            'id' : 'id',
            'last_ip' : 'last_ip',
            'code' : 'code'
        }
    },

    parse_history : function(result_table) {
        var self = this;
        var page = $.parseXML(this.page);

        var contest = CATS.App.contests[this.contest_id];
        if (contest == undefined)
            contest = this.add_contest();

        $(page).find('reqs').find('req').each(function () {
            var row = {};
            $(this).children().each(function() {
                if (self.aliases[$(this)[0].tagName] != undefined)
                    row[self.aliases[$(this)[0].tagName]] = $(this).text();
            });

            //add problem to contest and controller
            var prob = new CATS.Model.Problem();
            prob.name = prob.id = row['problem_title'];
            prob.code = row['code'];
            CATS.App.add_object(prob);
            contest.add_object(prob);
            //add user to contest and controller
            var user = new CATS.Model.User();
            user.name = row['team_name'];
            user.id = row['team_id'];
            CATS.App.add_object(user);
            contest.add_object(user);
            //add run to contest and controller
            var run = new CATS.Model.Run();
            run.id = row['id'];
            run.problem = prob.id;
            run.user = user.id;
            run.status = row['state'];
            run.start_processing_time = row['submit_time'].to_date();
            CATS.App.add_object(run);
            contest.add_object(run);
        });

        this.model = contest;
    },

    add_contest: function(v) {
        var contest = CATS.Model.Contest(), contests = [];
        contest.id = "cats_contest";
        contest.name = "cats_contest";
        contest.scoring = "acm";
        contest.start_time = "07.11.2014 18:00".to_date();
        CATS.App.add_object(contest);
        return contest;
    },

    get_contests: function(callback) {
        this.add_contest()
        callback(["cats_contest"]);
    },

    parse: function(result_table, callback) {
        this.parse_history(result_table);
        callback();
    }
});
