import Vue from 'vue'

import {iceConfig} from '../config'

const _sendInstance = new Vue();
const send = (event, from, to, msg) => _sendInstance.$socket.emit(event, {
    receiver: to,
    sender: from,
    data: msg
});

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
        init: (state, user) => {
            Vue.set(state.conversations, user, {});
        },
        remove: (state, user) => {
            Vue.delete(state.conversations, user);
            delete state.conversations[user];
        },
        state: (state, stateObj) => {
            Vue.set(state.conversations[stateObj.user], 'state', stateObj.state)
        },
        caller: (state, callerObj) => {
            Vue.set(state.conversations[callerObj.user], 'caller', callerObj.isCaller)
        },
        selfStream: (state, streamObj) => {
            Vue.set(state.conversations[streamObj.user], 'selfStream', streamObj.stream)
        },
        remoteStream: (state, streamObj) => {
            Vue.set(state.conversations[streamObj.user], 'remoteStream', streamObj.stream)
        },
        peerConnection: (state, pcObject) => {
            Vue.set(state.conversations[pcObject.user], 'pc', pcObject.pc)
        },

        SOCKET_CONNECT: (state) => {
            state.connected = true;
        },
        SOCKET_DISCONNECT: (state) => {
            state.connected = false;
        },
        SOCKET_ERR: (state, msg) => {
            console.error(msg[0]);
        }
    },
    actions: {
        ring: ({commit, rootState}, callObj) => {
            console.log(callObj);
            send('ring', rootState.login.user, callObj.user, null);
            commit('selfStream', {user: callObj.user, stream: callObj.stream});
            commit('caller', {user: callObj.user, isCaller: true});
            commit('state', {user: callObj.user, state: 'ringing'});
        },
        accept: ({commit, rootState}, callObj) => {
            console.log(callObj);
            send('start', rootState.login.user, callObj.user, null);
            commit('selfStream', {user: callObj.user, stream: callObj.stream});
            commit('caller', {user: callObj.user, isCaller: false});
            commit('state', {user: callObj.user, state: 'call'});
        },
        end: ({dispatch, rootState}, callObj) => {
            send('hangup', rootState.login.user, callObj.user, null);
            dispatch('clear', callObj);
        },
        clear: ({commit, state}, callObj) => {
            if(state.conversations[callObj.user].pc && state.conversations[callObj.user].selfStream){
                state.conversations[callObj.user].selfStream.getTracks().forEach(track => track.stop());
                state.conversations[callObj.user].pc.removeStream(state.conversations[callObj.user].selfStream)
            }
            if(state.conversations[callObj.user].pc){
                state.conversations[callObj.user].pc.close();
            }
            commit('peerConnection', {user: callObj.user, pc: new RTCPeerConnection(iceConfig)});
            commit('caller', {user: callObj.user, isCaller: false});
            commit('selfStream', {user: callObj.user, stream: null});
            commit('remoteStream', {user: callObj.user, stream: null});
            commit('state', {user: callObj.user, state: 'passive'});
        },
        connect: ({commit, state, rootState}, callObj) => {
            console.log(callObj);
            let off = null;
            commit('state',{user: callObj.user, state: 'call'});
            state.conversations[callObj.user].pc.onicecandidate = (e) => send('ice', rootState.login.user, callObj.user, e.candidate);
            state.conversations[callObj.user].pc.ontrack = (e) => {
                if(!state.conversations[callObj.user].remoteStream) commit('remoteStream', {user: callObj.user, stream: new MediaStream()});
                state.conversations[callObj.user].remoteStream.addTrack(e.track);
            };
            state.conversations[callObj.user].selfStream.getTracks().forEach(track =>{
                state.conversations[callObj.user].pc.addTrack(track, state.conversations[callObj.user].selfStream);
            });
            state.conversations[callObj.user].pc.createOffer()
                .then((sdp) => off = sdp)
                .then(() => state.conversations[callObj.user].pc.setLocalDescription(off))
                .then(() => send('offer', rootState.login.user, callObj.user, off))
        },
        negotiate({commit, state, rootState}, callObj){
            let ans = null;
            state.conversations[callObj.user].pc.onicecandidate = (e) => send('ice', rootState.login.user, callObj.user, e.candidate);
            state.conversations[callObj.user].pc.ontrack = (e) => {
                if(!state.conversations[callObj.user].remoteStream) commit('remoteStream', {user: callObj.user, stream: new MediaStream()});
                state.conversations[callObj.user].remoteStream.addTrack(e.track);
            };
            state.conversations[callObj.user].selfStream.getTracks().forEach(track => {
                state.conversations[callObj.user].pc.addTrack(track, state.conversations[callObj.user].selfStream)
            });
            state.conversations[callObj.user].pc.setRemoteDescription(callObj.off)
                .then(() => state.conversations[callObj.user].pc.createAnswer(callObj.off))
                .then((sdp) => ans = sdp)
                .then(() => state.conversations[callObj.user].pc.setLocalDescription(ans))
                .then(() => send('answer', rootState.login.user, callObj.user, ans))
        },
        finalize({state}, callObj){
            state.conversations[callObj.user].pc.setRemoteDescription(callObj.ans);
        },

        socket_hello: ({dispatch, commit, state}, user) => {
            if(Object.keys(state.conversations).indexOf(user) < 0){
                commit('init', user);
                dispatch('clear', {user});
            }
        },
        socket_online: ({dispatch, commit, state}, users) => {
            users.forEach(user => {
                commit('init', user);
                dispatch('clear', {user});
            });
        },
        socket_bye: ({commit}, user) => {
            commit('remove', user);
        },
        socket_ring: ({commit}, msg) => {
            commit('state', {user: msg.sender, state: 'picking'})
        },
        socket_start: ({dispatch}, msg) => {
            dispatch('connect', {user: msg.sender})
        },
        socket_hangup: ({dispatch}, msg) => {
            dispatch('clear', {user: msg.sender})
        },
        socket_ice: ({state}, msg) => {
            state.conversations[msg.sender].pc.addIceCandidate(msg.data)
        },
        socket_offer: ({dispatch}, msg) => {
            dispatch('negotiate', {user: msg.sender, off: msg.data})
        },
        socket_answer: ({dispatch}, msg) => {
            dispatch('finalize', {user: msg.sender, ans: msg.data})
        }
    }
};