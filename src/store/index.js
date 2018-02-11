// User store. I will probably not modularize this, since the user information is the only real application state
import Vue from 'vue';
import Vuex from 'vuex'
import calls from './calls'
import login from './login'

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        calls,
        login
    }
});