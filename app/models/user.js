CATS.Model.User = Classify(CATS.Model.Entity, {
    init: function () {
        this.$$parent();
        this.type = "user"
        this.name = null;
        this.contest = null;//?
        this.url = null;
        this.full_name = null;
        this.login = null;
        this.email = null;
        this.affiliation = {};//: { city?, school?, region?, country? }
        this.region = {
            name: null
        };
        //: "in_contest"* | "out_of_contest" | "virtual" | "jury", ? "commentator"
        this.role = "in_contest";
        this.time_offset = null;//: seconds
        this.is_remote = null;
        this.last_ip = null;
        this.last_action_time = null;//: ISO8601
    },

    some_affiliation: function() {
        var a = this.affiliation;
        return a.school || a.region || a.city || a.country || '';
    },
});