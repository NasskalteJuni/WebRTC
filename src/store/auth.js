import generate from "../helpers/avatarGenerator";

export default {
    state: {
        name: "",
        avatar: "",
        loggedIn: false,
        errors: []
    },
    mutations: {
        rename: (state, name) => state.name = name,
        toggleLogin: (state) => state.loggedIn = !state.loggedIn,
        restyle: (state, url) => state.avatar = url,
        fail: (state, error) => state.errors.push(error),
        clearFails: (state) => state.errors = [],
    },
    actions: {

        login: ({commit, dispatch, state}, name) => {
            if(!state.loggedIn){
                commit('restyle', generate(name,200));
                commit('rename', name);
                commit('toggleLogin');
            }
            return Promise.resolve(name);
        },

        logout({commit, state}){
            let name = state.name;
            if(state.loggedIn){
                commit('restyle','');
                commit('rename', '');
                commit('toggleLogin');
            }
            return Promise.resolve(name);
        },

        check({commit, state}, name){
            return new Promise((resolve, reject) => {
                commit('clearFails');
                const len = name.length;
                const mtc = name.match(/[a-z_]/g);
                const underscore = name.replace('_','').length === 0;
                const empty = len === 0, short = len < 2, long = len > 20, characters = !mtc || mtc.length !== len;
                if (empty || short || long || characters) {
                    if (empty) {
                        commit('fail', 'Bitte geben sie etwas ein');
                    } else if (short) {
                        commit('fail', 'Bitte wählen sie einen längeren Namen');
                    } else if (long) {
                        commit('fail', 'Bitte wählen sie einen kürzeren Namen');
                    }
                    if (underscore){
                        commit('fail', 'Bitte verwenden sie nicht nur Underscores');
                    }
                    if (!empty && characters) {
                        commit('fail', 'Bitte verwenden sie nur Kleinbuchstaben und auch keine Umlaute')
                    }
                }
                if(state.errors.length === 0) resolve(name);
                else reject(state.errors);
            });
        }

    }
};