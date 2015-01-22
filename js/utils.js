function add_time(date, time) {
    var d = new Date();
    d.setTime(date.getTime() + time * 60000);

    return d.format("dd.mm.yyyy hh:MM");
}

function get_problem_code(id) {
    return String.fromCharCode(65 + id);
}

function get_problem_id(code) {
    return code.charCodeAt(0) - 65;
}

function string_to_date(str) {
    var d = str.split(" ");
    var date = d[0].split(".");
    var time = d[1].split(":");

    return new Date(date[2], date[1], date[0], time[0], time[1]);
}

function get_time_diff(date1, date2) {
    return Math.floor((date2 - date1) / (1000*60));
}