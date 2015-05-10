Array.prototype.top = function () {
    return this[this.length - 1];
}

Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
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
