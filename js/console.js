$("document").ready(function(){
    $("#result_table").blur(function () {
        var page = $("#result_table").val();
        $("#display").html(JSON.stringify(ifmo_parse(page)));
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
