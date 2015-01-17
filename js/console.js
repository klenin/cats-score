$("document").ready(function(){
    $("#result_table").blur(function () {
        var table_content = $("#result_table").val();
        console.log(table_content);
    });
    function ajaxStart(){
        $('#progress').show();
    }

    function ajaxStop() {
        $('#progress').hide();
    }

    function parserGo(){
        ajaxStart();
        $.ajax({
            url: $('#result_table_url').val(),
            crossDomain: true,
            dataType: 'jsonp',
            success: function (data) {
                alert(data);
                ajaxStop();
            },
            error: function (e, g, f) {
                console.log(e);
                ajaxStop();
            }
        });
    }

    $("#start").click(function () {
        parserGo();
    });
});
