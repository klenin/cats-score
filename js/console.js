$("document").ready(function(){
    $("#result_table").blur(function () {
        var page = $("#result_table").val();
        var a = new Ifmo_adapter(page);
        $("#display").html(JSON.stringify(a.get_data_for_table_model()));
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
