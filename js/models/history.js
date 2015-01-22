function History_model(contest_start_time, problems) {
    this.name = 'history';
    this.problems = problems == undefined ? [] : problems;
    this.runs = [];

    this.contest_start_time = (contest_start_time == undefined) ? new Date() : contest_start_time;
}
