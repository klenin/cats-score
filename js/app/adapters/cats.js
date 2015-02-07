CATS.Adapter.Cats = Classify({

    init : function(page) {
        this.page = page;
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

    parse_history : function(contest, result_table) {
        var self = this;
        var page = $.parseXML(this.page);
        contest.name = "cats contest";
        contest.scoring = "acm";
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
            run.problem = prob.id;
            run.user = user.id;
            run.status = row['state'];
            run.start_processing_time = row['submit_time'];
            CATS.App.add_object(run);
            contest.add_object(run);
        });

        this.model = contest;
    },

    parse: function(contest, result_table) {
        this.parse_history(contest, result_table);
    }
});
