CATS.Model.Event = Classify(CATS.Model.Entity, {
    init: function () {
        this.$$parent();
        this.type = "event";
        this.time = null;
    }
});