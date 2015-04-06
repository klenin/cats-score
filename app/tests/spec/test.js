describe("Acm rule testing", function() {
    it("ifmo table", function() {
        CATS.App.adapter_process_contest("ifmo", function(ifmo) {
            var c = CATS.App.contests[ifmo.contests[0]];
            var t = CATS.App.result_tables[ifmo.table];
            var r = CATS.Rule.Acm();
            var t2 = CATS.Model.Results_table();
            r.compute_table(t2, c);
            t.throw_teams_with_no_solutions();
            t2.throw_teams_with_no_solutions();
            for(var i = 0; i < t.score_board.length; ++i) {
                expect(t.score_board[i]['place']).toEqual(t2.score_board[i]['place']);
                expect(t.score_board[i]['user']).toEqual(t2.score_board[i]['user']);
                expect(t.score_board[i]['penalty']).toEqual(t2.score_board[i]['penalty']);
                for(var j = 0; j < t.score_board[i]['problems'].length; ++j)
                    expect(t.score_board[i]['problems'][j]).toEqual(t2.score_board[i]['problems'][j]);
            }
        }, "ifmo_contest");
    });
});