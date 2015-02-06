CATS.Model.Compiler = Classify(CATS.Model.Entity, {
    init: function () {
        this.$$parent();
        this.type = "compiler";
    }
});