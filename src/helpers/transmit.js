import Vue from "vue";


const send = (user) => (event, msg) => (new Vue()).$socket.emit(event, {
    receiver: user,
    data: msg
});

const receive = (user) => (event, func) => (new Vue()).$socket.on(event, (msg) => {
    if(msg.sender === user) func(msg.data);
});

export {send, receive};

export default {
    send,
    receive
}