function History_model(contest_start_time) {
    this.name = 'history';
    this.runs = [];
    this.problems = [];

    this.contest_start_time = (contest_start_time == undefined) ? new Date() : contest_start_time;
}
