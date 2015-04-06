CATS.Model.Prize = Classify(CATS.Model.Entity, {
    init: function () {
        this.$$parent();
        this.type = "prize";
        this.worst_rank = null;
    }
});