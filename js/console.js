$("document").ready(function(){
    $("#result_table").blur(function () {
        var page = $("#result_table").val();
        var m = new Table_model();
        var a = new Ifmo_adapter(page, m);
        var r = new Acm_rules(a.get_model());
        $("#display").html(JSON.stringify(r.translate_to_history()) + "<br />");
    });

    $("#run_history").blur(function () {
        var page = $("#run_history").val();
        var m = new History_model(string_to_date("07.11.2014 18:00"));
        var a = new Cats_adapter(page, m);
        var r = new Acm_rules(a.get_model());
        $("#display").html(JSON.stringify(r.translate_to_table()) + "<br />");
    });
    function ajax_start(){
        $('#progress').show();
    }

    function ajax_stop() {
        $('#progress').hide();
    }

    function parser(){
        ajax_start();
        $.ajax({
            url: $('#result_table_url').val(),
            crossDomain: true,
            dataType: 'jsonp',
            success: function (data) {
                alert(data);
                ajax_stop();
            },
            error: function (e, g, f) {
                console.log(e);
                ajax_stop();
            }
        });
    }

    $("#start").click(function () {
        parser();
    });
});
