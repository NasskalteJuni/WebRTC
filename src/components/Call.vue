<template>
    <v-layout row wrap>
        <v-flex xs10 offset-xs1>
            <div class="call-container">
                <video class="external-video" autoplay ref="external" :src="remoteSrc">

                </video>
                <video class="self-video"autoplay ref="self" :src="selfSrc" v-if="isCallstateOf(['call'])"></video>
                <div class="notice-container" v-if="isCallstateOf(['picking'])">
                    <p class="notice">{{partner}} ruft an...</p>
                </div>
                <div class="controls-container">
                    <div class="controls primary">
                        <v-btn fab v-if="isCallstateOf(['passive', 'picking'])" color="green" class="white--text" @click="communicate">
                            <v-icon>call</v-icon>
                        </v-btn>
                        <v-btn fab v-if="isCallstateOf(['ringing', 'picking', 'call'])" color="red" class="white--text" @click="stop">
                            <v-icon>call_end</v-icon>
                        </v-btn>
                        <v-btn fab v-if="isCallstateOf(['call', 'passive','ringing'])" @click="muted=!muted">
                            <v-icon v-text="muted ? 'mic' : 'mic_off'"/>
                        </v-btn>
                    </div>
                </div>
            </div>
        </v-flex>
        <v-flex xs10 offset-xs1>

        </v-flex>
    </v-layout>
</template>

<script>

    export default {
        name: "call",
        data(){
            return {
                muted: false,
            };
        },
        computed: {
            partner(){
                let name = this.$route.params.id;
                if(this.$store.getters.users.indexOf(name) < 0) this.$router.push('/');
                return name;
            },
            call(){
                return this.$store.getters.call(this.partner);
            },
            callstate(){
                return this.call ? this.call.state : '';
            },
            selfSrc(){
                return (this.call && this.call.selfStream) ? window.URL.createObjectURL(this.call.selfStream) : '';
            },
            remoteSrc(){
                return (this.call && this.call.remoteStream) ? window.URL.createObjectURL(this.call.remoteStream) : '';
            }
        },
        methods:{
            communicate(){
                window.navigator.mediaDevices.getUserMedia({video: true, audio: true})
                    .then((stream) => {
                        if(this.call.state === 'passive') {
                            this.$store.dispatch('ring', {stream, user: this.partner});
                        }else{
                            this.$store.dispatch('accept', {stream, user: this.partner});
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        this.$store.dispatch('end', {user: this.partner});
                    });
            },
            stop(){
                this.$store.dispatch('end', {user: this.partner});
            },
            isCallstateOf(states){
                return states.indexOf(this.callstate) >= 0;
            }
        }
    }
</script>

<style scoped>
    .call-container{
        position: relative;
        min-height: 70vh;
    }

    .controls-container, .notice-container{
        width: 100%;
        height: auto;
        padding: 0.1em;
        z-index: 2;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .controls-container{
        position: absolute;
        bottom: 1em;
        left: 0;
    }

    .notice-container{
        position: absolute;
        left: 0;
        top: 40%;
    }

    .external-video{
        z-index: 0;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: gray;
    }

    .self-video{
        position: absolute;
        right: 1em;
        bottom: 1em;
        width: auto;
        height: 20%;
        z-index: 1;
        box-shadow: 0 0 25px rgba(0,0,0,0.2);
    }

    .controls{
        min-width: 11em;
        height: 4.5em;
        border-radius: 2em;
        display: flex;
        align-items: center;
        justify-content: space-around;
    }

    .controls>button{
        margin: 0.5em;
    }

    .notice{
        font-size: 2em;
        position: relative;
        color: white;
        animation: blink 2s ease infinite, shake 1s linear infinite;
    }

    @keyframes blink{
        0%{
            opacity: 0;
        }
        50%{
            opacity: 0.5;
        }
        100% {
            opacity: 1;
        }
    }

    @keyframes shake {
        0%{
            left: 0;
        }
        25%{
            left: 10px;
        }
        50%{
            left: 0;
        }
        75%{
            left: -10px;
        }
        100%{
            left: 0;
        }
    }
</style>