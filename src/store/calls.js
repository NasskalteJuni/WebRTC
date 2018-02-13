import Vue from 'vue'
import {iceConfig} from '../config'

const _sendInstance = new Vue();
const send = (event, from, to, msg) => _sendInstance.$socket.emit(event, {
    receiver: to,
    sender: from,
    data: msg
});
const log = (a, b = '') => {
    if(window.RTC_VERBOSE) console.log(a, b);
};

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
        mute: (state, configObj) => {
            Vue.set(state.conversations[configObj.user],'muted',configObj.state)
        },
        hide: (state, configObj) => {
            Vue.set(state.conversations[configObj.user],'hidden', configObj.state)
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
            log('send "ring" message to '+callObj.user+' over socket-connection to ask the user, if he wants to connect');
            send('ring', rootState.auth.user, callObj.user, null);
            commit('selfStream', {user: callObj.user, stream: callObj.stream});
            commit('caller', {user: callObj.user, isCaller: true});
            commit('state', {user: callObj.user, state: 'ringing'});
        },
        accept: ({commit, rootState}, callObj) => {
            log('send "accept" message to '+callObj.user+' over socket-connection to say, that you agree to connect');
            send('start', rootState.auth.user, callObj.user, null);
            commit('selfStream', {user: callObj.user, stream: callObj.stream});
            commit('caller', {user: callObj.user, isCaller: false});
            commit('state', {user: callObj.user, state: 'call'});
        },
        end: ({dispatch, rootState}, callObj) => {
            log('send "hangup" message to '+callObj.user+' over socket-connection to say that you do not want to talk (any more)');
            send('hangup', rootState.auth.user, callObj.user, null);
            dispatch('clear', callObj);
        },
        enable: ({commit, state}, configObj) => {
            log('changing audio state of '+configObj.kind+' for '+configObj.user);
            if(state.conversations[configObj.user] && state.conversations[configObj.user].selfStream && state.conversations[configObj.user].selfStream.getTracks){
                state.conversations[configObj.user].selfStream.getTracks().forEach(track => {
                    if(track.kind === configObj.kind){
                        if(configObj.toggle === true){
                            console.log('toggle',configObj.user);
                            commit(configObj.kind === 'video' ? 'hide' : 'mute', {user: configObj.user, state: track.enabled});
                            track.enabled = !track.enabled;
                        }else if(typeof configObj.to === 'boolean'){
                            console.log('toggle',configObj.user);
                            track.enabled = configObj.to;
                            commit(configObj.kind === 'video' ? 'hide' : 'mute', {user: configObj.user, state: !track.enabled});
                        }
                    }
                });
            }
        },
        clear: ({commit, state}, callObj) => {
            log('tidy up connection, set everything to its default value');
            if(!state.conversations || !state.conversations[callObj.user]) return;
            if(state.conversations[callObj.user].pc && state.conversations[callObj.user].selfStream){
                state.conversations[callObj.user].selfStream.getTracks().forEach(track => track.stop());
                state.conversations[callObj.user].pc.removeStream(state.conversations[callObj.user].selfStream)
            }
            if(state.conversations[callObj.user].pc){
                state.conversations[callObj.user].pc.close();
            }
            commit('mute',{user: callObj.user, to: false});
            commit('hide', {user: callObj.user, to: false});
            commit('peerConnection', {user: callObj.user, pc: new RTCPeerConnection(iceConfig)});
            commit('caller', {user: callObj.user, isCaller: false});
            commit('selfStream', {user: callObj.user, stream: null});
            commit('remoteStream', {user: callObj.user, stream: null});
            commit('state', {user: callObj.user, state: 'passive'});
        },
        connect: ({commit, state, rootState}, callObj) => {
            log('connect to '+callObj.user+' by setting ice and track handlers for the RTCPeerConnection');
            let off = null;
            commit('state',{user: callObj.user, state: 'call'});
            state.conversations[callObj.user].pc.onicecandidate = (e) => send('ice', rootState.auth.user, callObj.user, e.candidate);
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
                .then(() => send('offer', rootState.auth.user, callObj.user, off))
                .then(() => log('create and send '+callObj.user+' an offer with Media-Codecs, Adresses, etc.', off));
        },
        negotiate({commit, state, rootState}, callObj){
            log('received an offer of user '+callObj.user+', that describes the users preferred media codecs', callObj.off)
            let ans = null;
            state.conversations[callObj.user].pc.onicecandidate = (e) => send('ice', rootState.auth.user, callObj.user, e.candidate);
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
                .then(() => send('answer', rootState.auth.user, callObj.user, ans))
                .then(() => log('send your answer to which media codecs you can provide to '+callObj.user, ans))
        },
        finalize({state}, callObj){
            log('receive an Answer of '+callObj.user+' to your offer and set it to initiate sharing media in a compatible way', callObj.ans)
            state.conversations[callObj.user].pc.setRemoteDescription(callObj.ans);
        },

        socket_hello: ({dispatch, commit, state}, user) => {
            if(Object.keys(state.conversations).indexOf(user) < 0){
                log('a new user is online: '+user);
                commit('init', user);
                dispatch('clear', {user});
            }
        },
        socket_online: ({dispatch, commit, state}, users) => {
            users.forEach(user => {
                log('the user '+user+' is online');
                commit('init', user);
                dispatch('clear', {user});
            });
        },
        socket_bye: ({dispatch, commit}, user) => {
            log('the user '+user+' is now gone');
            dispatch('clear', {user});
            commit('remove', user);
        },
        socket_ring: ({commit}, msg) => {
            log(msg.sender+' sent a "ring" message and wants to initiate a call');
            commit('state', {user: msg.sender, state: 'picking'})
        },
        socket_start: ({dispatch}, msg) => {
            log(msg.sender+' sent a "start" message, so the PeerConnection Media sharing can be prepared');
            dispatch('connect', {user: msg.sender})
        },
        socket_hangup: ({dispatch}, msg) => {
            log(msg.sender+' sent a "hangup" message and quit the conversation');
            dispatch('clear', {user: msg.sender})
        },
        socket_ice: ({state}, msg) => {
            log(msg.sender+' could be reachable under the address ',msg.data)
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