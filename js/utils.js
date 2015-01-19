function add_time(date, time) {
    var d = new Date();
    var t = time.split(':');
    d.setTime(date.getTime() + (t[0] * 60 + t[1]) * 1000);
    return d;
}

function get_problem_code(id) {
    return String.fromCharCode(65 + id);
}