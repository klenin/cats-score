CATS.Model.User = Classify(CATS.Model.Entity, {
    init: function () {
        this.$$parent();
        this.type = "user";
        this.contest = null;//?
        this.url = null;
        this.full_name = null;
        this.login = null;
        this.email = null;
        this.affiliation = null;//: { name: }
        this.region = {
            name: null
        };
        this.role = "in_contest";//: "in_contest"* | "out_of_contest" | "virtual" | "jury", ? "commentator"
        this.time_offset = null;//: seconds
        this.is_remote = null;
        this.last_ip = null;
        this.last_action_time = null;//: ISO8601
    }
});