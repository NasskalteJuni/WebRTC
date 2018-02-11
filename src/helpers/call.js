export default class Call{
    constructor(send, receive, config){
        console.log('constructed new Call');
        this.config = config;
        this.send = send;
        this.receive = receive;
        this.caller = false;
        this.pc = new RTCPeerConnection(config);
        this.__streamSelf(null);
        this.__streamRemote(null);
        this.state = 'passive';

        this.receive('ring', () => this.state = 'picking');
        this.receive('start', () => this.__connect());
        this.receive('hangup', () => this.__clear());
        this.receive('ice', (ice) => this.pc.addIceCandidate(ice));
        this.receive('offer', (off) => this.__negotiate(off));
        this.receive('answer', (ans) => this.__finalize(ans));
    }

    ring(stream){
        console.log('called ring', stream, this);
        this.__streamSelf(stream);
        this.send('ring');
        this.caller = true;
        this.state = 'ringing';
    }

    accept(stream){
        console.log('called accept', stream, this);
        this.__streamSelf(stream);
        this.send('start');
        this.state = 'call'
    }

    end(){
        this.send('hangup');
        this.__clear();
    }

    __clear(){
        console.log('called clear', this._streamSelf, this);
        if(this.pc && this._streamSelf){
            this.pc.removeStream(this._streamSelf)
        }
        if(this.pc){
            this.pc.close()
        }
        this.pc = new RTCPeerConnection(this.config);
        this.caller = false;
        this.__streamSelf(null);
        this.__streamRemote(null);
        this.state = 'passive';
    }

    __connect(){
        let off = null;
        this.pc.onicecandidate = (e) => this.send('ice', e.candidate);
        this.pc.ontrack = (e) => this.__streamRemote(e.track);
        this._streamSelf.getTracks().forEach(track => this.pc.addTrack(track, this._streamSelf));
        this.pc.createOffer()
            .then((sdp) => off = sdp)
            .then(() => this.pc.setLocalDescription(off))
            .then(() => this.send('offer', off))
    }

    __negotiate(off){
        let ans = null;
        this.pc.onicecandidate = (e) => this.send('ice', e.candidate);
        this.pc.ontrack = (e) => this.__streamRemote(e.track);
        console.log('called negotiate', this._streamSelf, this);
        this._streamSelf.getTracks().forEach(track => this.pc.addTrack(track, this._streamSelf));
        this.pc.setRemoteDescription(off)
            .then(() => this.pc.createAnswer(off))
            .then((sdp) => ans = sdp)
            .then(() => this.pc.setLocalDescription(ans))
            .then(() => this.send('answer', ans))
    }

    __finalize(ans){
        console.log('called finalize', this._streamSelf, this);
        return this.pc.setRemoteDescription(ans)
    }

    __streamSelf(stream){
        console.log('set stream self', stream, this);
        this._streamSelf = stream;
    }

    __streamRemote(stream){
        console.log('set stream remote', stream, this);
        this.streamRemote = stream;
    }

}