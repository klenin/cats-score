function Contest_info_model(contest_start_time, problems) {
    this.problems = problems == undefined ? [] : problems;
    this.contest_start_time = (contest_start_time == undefined) ? new Date() : contest_start_time;
}
