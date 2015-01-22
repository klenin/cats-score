$("document").ready(function(){

    $("#run_tests").click(function () {
        var t = new Controller_tests();
        $("#display").html(t.run_tests());
    });

    function ajax_start(){
        $('#progress').show();
    }

    function ajax_stop() {
        $('#progress').hide();
    }

    function loader(){
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
        loader();
    });
});
