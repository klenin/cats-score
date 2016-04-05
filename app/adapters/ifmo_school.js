CATS.Adapter.IfmoSchool = Classify({
    init : function(page) {
        if (page != undefined)
            this.page = page;

        this.name = 'ifmo_school';
    },

    assert: function (b, msg) {
        if (!b) throw "Assertion failed " + msg;
    },

INDEX_BY_POINTER: {
    "0": "\u0402",
    "1": "\u0403",
    "2": "\u201A",
    "3": "\u0453",
    "4": "\u201E",
    "5": "\u2026",
    "6": "\u2020",
    "7": "\u2021",
    "8": "\u20AC",
    "9": "\u2030",
    "10": "\u0409",
    "11": "\u2039",
    "12": "\u040A",
    "13": "\u040C",
    "14": "\u040B",
    "15": "\u040F",
    "16": "\u0452",
    "17": "\u2018",
    "18": "\u2019",
    "19": "\u201C",
    "20": "\u201D",
    "21": "\u2022",
    "22": "\u2013",
    "23": "\u2014",
    "24": "\u0098",
    "25": "\u2122",
    "26": "\u0459",
    "27": "\u203A",
    "28": "\u045A",
    "29": "\u045C",
    "30": "\u045B",
    "31": "\u045F",
    "32": "\u00A0",
    "33": "\u040E",
    "34": "\u045E",
    "35": "\u0408",
    "36": "\u00A4",
    "37": "\u0490",
    "38": "\u00A6",
    "39": "\u00A7",
    "40": "\u0401",
    "41": "\u00A9",
    "42": "\u0404",
    "43": "\u00AB",
    "44": "\u00AC",
    "45": "\u00AD",
    "46": "\u00AE",
    "47": "\u0407",
    "48": "\u00B0",
    "49": "\u00B1",
    "50": "\u0406",
    "51": "\u0456",
    "52": "\u0491",
    "53": "\u00B5",
    "54": "\u00B6",
    "55": "\u00B7",
    "56": "\u0451",
    "57": "\u2116",
    "58": "\u0454",
    "59": "\u00BB",
    "60": "\u0458",
    "61": "\u0405",
    "62": "\u0455",
    "63": "\u0457",
    "64": "\u0410",
    "65": "\u0411",
    "66": "\u0412",
    "67": "\u0413",
    "68": "\u0414",
    "69": "\u0415",
    "70": "\u0416",
    "71": "\u0417",
    "72": "\u0418",
    "73": "\u0419",
    "74": "\u041A",
    "75": "\u041B",
    "76": "\u041C",
    "77": "\u041D",
    "78": "\u041E",
    "79": "\u041F",
    "80": "\u0420",
    "81": "\u0421",
    "82": "\u0422",
    "83": "\u0423",
    "84": "\u0424",
    "85": "\u0425",
    "86": "\u0426",
    "87": "\u0427",
    "88": "\u0428",
    "89": "\u0429",
    "90": "\u042A",
    "91": "\u042B",
    "92": "\u042C",
    "93": "\u042D",
    "94": "\u042E",
    "95": "\u042F",
    "96": "\u0430",
    "97": "\u0431",
    "98": "\u0432",
    "99": "\u0433",
    "100": "\u0434",
    "101": "\u0435",
    "102": "\u0436",
    "103": "\u0437",
    "104": "\u0438",
    "105": "\u0439",
    "106": "\u043A",
    "107": "\u043B",
    "108": "\u043C",
    "109": "\u043D",
    "110": "\u043E",
    "111": "\u043F",
    "112": "\u0440",
    "113": "\u0441",
    "114": "\u0442",
    "115": "\u0443",
    "116": "\u0444",
    "117": "\u0445",
    "118": "\u0446",
    "119": "\u0447",
    "120": "\u0448",
    "121": "\u0449",
    "122": "\u044A",
    "123": "\u044B",
    "124": "\u044C",
    "125": "\u044D",
    "126": "\u044E",
    "127": "\u044F"
}
,
    decode: function(input) {
        var length = input.length;
        var index = -1;
        var byteValue;
        var pointer;
        var result = '';
        while (++index < length) {
            byteValue = input.charCodeAt(index);
            // “If `byte` is in the range `0x00` to `0x7F`, return a code point whose
            // value is `byte`.”
            if (byteValue >= 0x00 && byteValue <= 0x7F) {
                result += String.fromCharCode(byteValue);
                continue;
            }
            // “Let `code point` be the index code point for `byte − 0x80` in index
            // `single-byte`.”
            pointer = byteValue - 0x80;
            result += this.INDEX_BY_POINTER[pointer];
            //} else {
                // “If `code point` is `null`, return `error`.”
                //result += error(null, mode);
            //}
        }
        return result;
    },

    parse_score_board: function(contest_id, result_table) {
        var self = this;
        var page = this.page;
        var contest = CATS.App.contests[contest_id];
        if (contest == undefined)
            contest = this.add_contest({id: contest_id, name: 'ROI ' + contest_id});

        var self = this;
        var source_rows = $('<div/>').append(page).find('table.standings tr');
        console.log(source_rows[0]);
        result_table.scoring = 'school';

        var problems = [];
        $(source_rows[0]).children('th.problem').each(function () {
            var prob = $.extend(new CATS.Model.Problem(), {
                id: $(this).text(),
                name: self.decode($(this).attr('title')),
                code: $(this).text(),
                max_points: 100
            });
            CATS.App.add_object(prob);
            contest.add_object(prob);
            problems.push(prob.id);
        });
        source_rows.splice(0, 1);
        var re = /^(.+)\((.+)\)$/;
        _.each(source_rows, function (source_row) {
            var items = $(source_row).children('td');
            if (!$(items[0]).hasClass('rank')) return;

            var row = result_table.get_empty_score_board_row();
            row.place = parseInt($(items[0]).text());

            self.assert($(items[1]).hasClass('party'));
            var t = self.decode($(items[1]).text());
            var m = t.match(re);
            row.user = m ? m[1] : t;
            var user = new CATS.Model.User();
            user.name = user.id = row.user;
            user.affiliation.region = m[2];
            CATS.App.add_object(user);
            contest.add_object(user);

            for (var i = 0; i < problems.length; ++i) {
                var p = $(items[i + 2]);
                var prob = result_table.get_empty_problem_for_score_board_row();
                prob.problem = problems[i];
                var solved_src = p.children('i').text();
                prob.is_solved = solved_src !== '.';
                prob.points = prob.is_solved ? parseInt(solved_src) : 0;

                if (prob.is_solved) {
                    row.solved_cnt++;
                    row.run_cnt++;
                }
                row.problems.push(prob);
            }

            //self.assert(parseInt($(items[i + 2]).text()) === row.solved_cnt, $(items[i + 2]).text());

            result_table.score_board.push(row);
        });
    },

    add_contest: function(v) {
        var contest = CATS.Model.Contest(), contests = [];
        contest.id = v.id;
        contest.name = v.name;
        contest.scoring = 'school';
        contest.start_time = new Date();
        contest.finish_time = CATS.App.utils.add_time(contest.start_time, 300);
        CATS.App.add_object(contest);
        return contest;
    },

    url: 'http://neerc.ifmo.ru/',
    minimal_year: 2000,

    get_contests: function(callback) {
        var self = this;
        CATS.App.utils.cors_get_html(this.url + 'past/index.html', function (page) {
            var contests = [];
            var c1 = { id: 'roi', name: 'ROI Current' };
            self.add_contest(c1);
            contests.push(c1.id);
            /*var c = { id: 'current', name: 'Current' };
            self.add_contest(c);
            contests.push(c.id);
            $(page).find('td.neercyear a').each(function () {
                var year = $(this).text().match(/\d+/g)[0];
                if (year <= self.minimal_year)
                    return;
                var c = { id: year, name: $(this).text() };
                self.add_contest(c);
                contests.push(c.id);
            });*/
            callback(contests);
        })
    },

    get_contest: function(callback, contest_id) {
        if (contest_id === 'roi') {
            CATS.App.utils.proxy_get_html('http://37.29.7.66/~supersecret/standings-roi-2016-day1-abacabadabacaba.html', callback);
            return;
        }
        return;
        var url_part = contest_id == 'current' ? 'information' : 'past/' + contest_id;
        CATS.App.utils.cors_get_html(this.url + url_part + '/standings.html', callback);
    },

    parse: function(contest_id, result_table, callback) {
        var self = this;
        this.get_contest(function (page) {
            self.page = page;
            self.parse_score_board(contest_id, result_table);
            callback();
        }, contest_id);
    }
});
