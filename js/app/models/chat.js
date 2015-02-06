CATS.Model.Chat = Classify(CATS.Model.Event, {
    init: function () {
        this.$$parent();
        this.type = "chat";
        this.user_from = null;//?: id | "_jury"
        this.user_to = null;//*: id | "_all" | "_jury"
        this.text = null;//*
        this.problem = null;//: id
        this.thread = null;//: id
        this.ip = null;
    }
});

