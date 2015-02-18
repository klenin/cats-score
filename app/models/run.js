CATS.Model.Run = Classify(CATS.Model.Event, {
    init: function () {
        this.$$parent();
        this.type = "run";
        this.problem = null;//*: id
        this.user = null;//*: id
        this.compiler = null;
        this.source = null;
        this.status = null;
        /*:
         "not_processed"*, "processing",
         "accepted", "partial", "compile_error", "runtime_error",
         "wrong_answer", "presentation_error", "memory_limit", "timie_limit", "idleness_limit",
         "security_violation", "unhandled_error", "ignored", "rejected", "challenged"?
         passed_test_count: \d+ (failed_test - 1)*/
        this.points = null;//: \d+
        this.start_processing_time = null;
        this.finish_processing_time = null;
        this.processor = null;
        this.ip = null;
        //tests: [...TODO]
        this.consumed = null;//?: { time: seconds, memory: bytes }
    }
});