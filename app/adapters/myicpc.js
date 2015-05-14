CATS.Adapter.MyIcpc = Classify({

    init : function(page) {
        if (page != undefined)
            this.page = page;
        this.xml = null;
        this.name = 'myicpc';
        this.model = null;
    },

    get_xml: function(callback) {
        var that = this;
        if (this.xml)
            return callback();
        $.ajax({
            // Avoid "not well-formed" error when loading JSON from local file.
            beforeSend: function(req) { req.overrideMimeType('application/xml'); },
            url: this.page,
            dataType: 'xml',
            success: function (data) {
                that.xml = $(data);
                callback();
            }
        });
    },

    node_to_js: function (dest, node, mapping) {
        var n = $(node);
        for(var k in mapping) {
            dest[k] = n.find(mapping[k]).text();
        }
    },

    parse_history : function(contest_id, result_table) {
        var self = this;
        var contest = CATS.App.contests[contest_id];
        if (contest == undefined)
            contest = this.add_contest();

        var root = this.xml.find('contest');
        root.find('problem').each(function(i, node) {
            var p = new CATS.Model.Problem();
            self.node_to_js(p, node, { id: 'id', name: 'title' });
            p.code = "_ABCDEFGHIJKLMNOPQRSTUVWXYZ"[p.id];
            CATS.App.add_object(p);
            contest.add_object(p);
        });

        root.find('team').each(function(i, node) {
            var user = new CATS.Model.User();
            self.node_to_js(user, node, { id: 'id', name: 'name' });
            self.node_to_js(user.affiliation, node, {
                country: 'nationality',
                city: 'region',
                school: 'university',
            });
            CATS.App.add_object(user);
            contest.add_object(user);
        });

        root.find('run').each(function(i, node) {
            var run = new CATS.Model.Run();
            self.node_to_js(run, node, { id: 'id', problem: 'problem', user: 'team' });
            var n = $(node);
            run.status = n.find('solved').text() === 'true' ? 'accepted' : 'wrong_answer';
            run.contest = contest_id;
            run.start_processing_time = new Date(n.find('timestamp').text() * 1000);
            CATS.App.add_object(run);
            contest.add_object(run);
        });

        this.model = contest;
    },

    add_contest: function() {
        var contest = CATS.Model.Contest();
        var root = this.xml.find('contest');
        var c = this.xml.find('info').first();
        contest.id = 'sample_contest';
        contest.name = c.find('title').text();
        contest.scoring = 'acm';
        var start_ts = c.find('starttime').text() * 1000;
        contest.start_time = new Date(start_ts);
        var hms = c.find('length').text().split(':');
        var f = contest.finish_time = new Date(start_ts);
        f.setHours(f.getHours() + 1*hms[0]);
        f.setMinutes(f.getMinutes() + 1*hms[1]);
        f.setSeconds(f.getSeconds() + 1*hms[2]);
        CATS.App.add_object(contest);
        return contest;
    },

    get_contests: function(callback) {
        var that = this;
        this.get_xml(function () { that.add_contest(); callback(['sample_contest']); });
    },

    parse: function(contest_id, result_table, callback) {
        var that = this;
        this.get_xml(function () { that.parse_history(contest_id, result_table); callback(); });
    }
});
