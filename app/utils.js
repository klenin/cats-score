CATS.Utils = Classify({
    init: function () {
    },

    add_time: function (date, time) {
        var d = new Date();
        d.setTime(date.getTime() + time * 60 * 1000);
        return d;
    },

    get_time_diff: function (date1, date2) {
        return Math.floor((date2 - date1) / (1000 * 60));
    },

    zeroPad: function (num, places) {
        var zero = places - num.toString().length + 1;
        return Array(+(zero > 0 && zero)).join("0") + num;
    },

    minutes_to_formated_hours: function (min) {
        return Math.floor(min / 60) + ":" + this.zeroPad(min % 60, 2);
    },

    formated_hours_to_minutes: function (h) {
        var time = h.split(":");
        return time[0] * 60 + time[1] * 1;
    },

    proxy_get: function(url, callback) {
        $.get(CATS.Config.proxy_path + "proxy.pl?u=" + encodeURIComponent(url), callback);
    },

    json_get: function (url, callback) {
        $.ajax({
            url: url,
            dataType: 'json',
            success: callback
        });
    },

    jsonp_get: function (url, callback) {
        var parseJsonp = function (data) {
            return data;
        }
        $.ajax({
            url: url + '&jsonp=parseJsonp',
            dataType: 'jsonp',
            jsonpCallback: 'parseJsonp',
            success: callback
        });
    }
});

Array.prototype.top = function () {
    return this[this.length - 1];
}

String.prototype.to_date = function () {
    if (this.length == 0)
        return new Date();

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

