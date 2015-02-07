CATS.Model.Entity = Classify({
    init: function () {
        this.type = "entity";
        this.id = CATS.App.get_new_id();
        this.external_id = null;
        this.version = CATS.Model.Version(1);
        this.tags = null;
        this.description = null;
    }
});