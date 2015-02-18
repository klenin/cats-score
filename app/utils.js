function add_time(date, time) {
    var d = new Date();
    d.setTime(date.getTime() + time * 60 * 1000);
    return d;
}

function get_problem_code_by_index(id) {
    return String.fromCharCode(65 + parseInt(id));
}

function get_problem_index(code) {
    return code.charCodeAt(0) - 65;
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

String.prototype.throw_last_chars = function (num) {
    return this.substring(0, this.length - num);
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function extendGetScriptFunction(base_script_place) {
    var getScript = $.getScript;

    $.getScript = function (resources, callback) {
        var loadScript = function (index) {
            var name = resources[index];
            console.log('Loading script: ' + name);
            getScript(base_script_place + name, function () {
                index++;
                if (index < resources.length) {
                    loadScript(index);
                } else {
                    callback();
                }
            }).fail(function(){
                if(arguments[0].readyState==0){
                    //script failed to load
                }else{
                    //script loaded but failed to parse
                    alert(arguments[2].toString());
                }
            });
        }

        loadScript(0);
    };
}

