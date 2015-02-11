function add_time(date, time) {
    var d = new Date();
    d.setTime(date.getTime() + time * 60 * 1000);

    return d.format("dd.mm.yyyy HH:MM");
}

function get_problem_code_by_index(id) {
    return String.fromCharCode(65 + parseInt(id));
}

function get_problem_index(code) {
    return code.charCodeAt(0) - 65;
}

function string_to_date(str) {
    var d = str.split(" ");
    var date = d[0].split(".");
    var time = d[1].split(":");

    return new Date(date[2], date[1] - 1, date[0], time[0], time[1]);
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

Array.prototype.top = function () {
    return this[this.length - 1];
}

function extendGetScriptFunction() {
    var getScript = $.getScript;

    $.getScript = function (resources, callback) {
        var loadScript = function (index) {
            var name = resources[index];
            console.log('Loading script: ' + name);
            getScript('js/app/' + name, function () {
                index++;
                if (index < resources.length) {
                    loadScript(index);
                } else {
                    callback();
                }
            })
        }

        loadScript(0);
    };
}

function get_jsonp(url, callback) {
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