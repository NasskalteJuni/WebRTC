import Vue from 'vue'
import Call from '../helpers/call'

import {iceConfig} from '../config'
import {send, receive} from '../helpers/transmit.js'

export default {
    state: {
        connected: false,
        conversations: {}
    },
    getters: {
        call: (state) => (user) => {
            return state.conversations[user];
        },
        users: (state) => {
            return Object.keys(state.conversations);
        }
    },
    mutations: {
        clear: (state) => {
            state.conversations = {};
            state.connected = false;
        },
        call: (state, config) => {
            console.log('set call as mutation')
            Vue.set(state.conversations, config.user, config.call);
        },
        SOCKET_CONNECT: (state) => {
            state.connected = true;
        },
        SOCKET_ONLINE: (state, users) => {
            users[0].forEach(user => {
                console.log('socket online, create new call');
                Vue.set(state.conversations,user, new Call(send(user), receive(user), iceConfig));
            });
        },
        SOCKET_HELLO: (state, user) => {
            user = user[0];
            console.log('socket hello, create new call');
            if(Object.keys(state.conversations).indexOf(user) < 0){
                Vue.set(state.conversations, user, new Call(send(user), receive(user), iceConfig));
            }
        },
        SOCKET_BYE: (state, user) => {
            user = user[0];
            console.log('socket bye, remove call');
            Vue.delete(state.conversations, user);
            delete state.conversations[user];
        },
        SOCKET_ERR: (state, msg) => {
            console.error(msg[0]);
        }
    },
    actions: {
        call: ({commit}, config) => commit('call', config),
        clear: ({commit}) => commit('clear')
    }
};