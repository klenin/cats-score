function add_time(date, time) {
    var d = new Date();
    d.setTime(date.getTime() + time * 60 * 1000);
    return d;
}

function get_time_diff(date1, date2) {
    return Math.floor((date2 - date1) / (1000 * 60));
}

function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}

function minutes_to_formated_hours(min) {
    return Math.floor(min / 60) + ":" + zeroPad(min % 60, 2);
}

function formated_hours_to_minutes(h) {
    var time = h.split(":");
    return time[0] * 60 + time[1] * 1;
}

Array.prototype.top = function () {
    return this[this.length - 1];
}

String.prototype.to_date = function () {
    var d = this.split(" ");
    var date = d[0].split(".");
    var time = d[1].split(":");

    return new Date(date[2], date[1] - 1, date[0], time[0], time[1]);
}

String.prototype.throw_last_chars = function (num) {
    return this.substring(0, this.length - num);
}

String.prototype.throw_first_chars = function (num) {
    return this.substring(num, this.length);
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

