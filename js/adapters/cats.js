function Cats_adapter(page, model) {
    this.page = page;
    this.model = model;

    this.aliaces = {
        'time_since_start' : 'time_since_start',
        'problem_title' : 'problem_title',
        'failed_test' : 'failed_test',
        'submit_time' : 'submit_time',
        'team_name' : 'team_name',
        'team_id' : 'team_id',
        'is_remote' : 'is_remote',
        'state' : 'state',
        'is_ooc' : 'is_ooc',
        'id' : 'id',
        'last_ip' : 'last_ip',
        'code' : 'code'
    }
}


Cats_adapter.prototype.parse_history = function() {
    var self = this;
    var page = $.parseXML(this.page);

    $(page).find('reqs').find('req').each(function () {
        var row = {};
        $(this).children().each(function(){
            row[$(this)[0].tagName] = $(this).text();
        });
        self.model.attempts.push(row);
    });
}

Cats_adapter.prototype.get_model = function() {
    if (this.model.attempts.length == 0)
        this.parse_history();

    return this.model;
}