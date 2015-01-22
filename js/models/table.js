function Table_model(contest_start_time) {
    this.name = 'table';
    this.problems = [];
    this.score_board = [];

    this.contest_start_time = (contest_start_time == undefined) ? new Date() : contest_start_time;
}
