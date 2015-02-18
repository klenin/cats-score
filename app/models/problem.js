CATS.Model.Problem = Classify(CATS.Model.Entity, {
    init: function () {
        this.$$parent();
        this.type = "problem";
        this.code = null;
        this.contest = null;//?
        this.language = null;
        this.text_url = null;
        this.package_url = null;
        this.status = null;//: "ok", "disabled", ? "on_hold", "hidden"
        this.max_points = null;
        this.last_update_time = null;
        // this.tests: [... TODO] // test_count
        this.limits = {
            time: null,
            memory: null
        }//: { time: seconds, memory: bytes, ... }
        this.baloon_color = null;//:
        this.data = null;//: object
    }
});