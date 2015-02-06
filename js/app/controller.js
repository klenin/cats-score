var CATS = {
    Model: {},
    Adapter: {},
    Rule: {},
    App: null,
    Controller: Classify({
        init: function () {
            //other
            this.adapters = {};
            this.rules = {};
            //models
            this.users = {};
            this.problems = {};
            this.prizes = {};
            this.contests = {};
            this.chats = {};
            this.runs = {};
            this.compilers = {};
            this.tables = {};

            this.last_id = 0;
        },

        add_object: function(obj) {
            this[obj.type + 's'][obj.id] = obj;
        },

        get_new_id: function() {
            return 'id_' + this.last_id++;
        },

        regist_adapter: function(adapter) {
            this.adapters[adapter.name] = adapter;
        },

        regist_rule: function(rule) {
            this.rules[rule.name] = rule;
        }
    })
};

