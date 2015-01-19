$("document").ready(function(){
    $("#result_table").blur(function () {
        var page = $("#result_table").val();
        var m = new Table_model()
        var a = new Ifmo_adapter(page, m);
        $("#display").html(JSON.stringify(a.get_model().problems) + "<br />" + JSON.stringify(a.get_model().score_board));
    });

    $("#attempt_history").blur(function () {
        var page = $("#attempt_history").val();
        var m = new History_model()
        var a = new Cats_adapter(page, m);
        $("#display").html(JSON.stringify(a.get_model().problems) + "<br />" + JSON.stringify(a.get_model().attempts));
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
