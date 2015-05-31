describe("Acm rule testing", function() {
    beforeEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    it("ifmo table", function(done) {
        var orign_table = new CATS.Model.Results_table();
        var cont_id = "2013";
        CATS.App.adapters["ifmo"].parse(cont_id, orign_table, function () {
            var contest = CATS.App.contests[cont_id];
            orign_table.contest = cont_id;
            CATS.App.rules[contest.scoring].process(contest, orign_table);
            var calculated_table = new CATS.Model.Results_table();
            calculated_table.contest = cont_id;
            CATS.App.rules[contest.scoring].process(contest, calculated_table);
            orign_table.throw_teams_with_no_solutions();
            calculated_table.throw_teams_with_no_solutions();
            var continue_place = 0;
            for(var i = 0; i < orign_table.score_board.length; ++i) {
                var o_row = orign_table.score_board[i];
                var c_row = calculated_table.score_board[i];

                if (i < orign_table.score_board.length - 1 && orign_table.score_board[i + 1]['place'] == o_row['place'])
                    continue_place = o_row['place'];

                if (c_row['place'] == continue_place)
                    continue;

                expect(o_row['place']).toEqual(c_row['place']);
                expect(o_row['user']).toEqual(c_row['user']);
                expect(o_row['penalty']).toEqual(c_row['penalty']);
                for (var j = 0; j < o_row['problems'].length; ++j) {
                    if (c_row['problems'][j]['is_solved'] == false)
                        c_row['problems'][j]['best_run_time'] == null;
                    expect(o_row['problems'][j]).toEqual(c_row['problems'][j]);
                }
            }
            done();
        });
    });
});