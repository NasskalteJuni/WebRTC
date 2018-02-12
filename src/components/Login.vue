<template>
    <v-layout row wrap fill-height align-center :reverse="!small">
        <v-flex xs12 md6 offset-md1>
            <avatar :name="name"/>
        </v-flex>
        <v-flex xs12 md5>
            <v-form v-on:submit.prevent="submitName()">
                <v-text-field label="Nutzername" v-model="name" :error-messages="errorMessages" id="login-name-field" autofocus autocomplete="off" required @keyup="check"/>
                <v-spacer class="mt-2"/>
                <v-checkbox v-model="agreement" label="AGB akzeptieren"/>
                <small class="subtext">Bitte die <router-link to="About#agb">AGB</router-link> durchlesen</small>
                <v-spacer class="mt-4 mb-4"/>
                <v-btn color="primary" class="white--text" type="submit" :disabled="!submittable">Name bestätigen</v-btn>
            </v-form>
        </v-flex>
    </v-layout>
</template>

<script>
    import Avatar from './Avatar'

    export default {
        name: "login",
        components: {
            Avatar
        },
        data(){
            return {
                name: this.randomName(),
                image: "",
                agreement: false
            };
        },
        computed: {
            submittable(){
                return this.$store.state.auth.errors.length === 0 && this.agreement;
            },
            errorMessages() {
                return this.$store.state.auth.errors;
            },
            loggedIn(){
                return this.$store.state.auth.loggedIn;
            },
            small() {
                let size = this.$vuetify.breakpoint.name;
                return (size === 'xs' || size === 'sm');
            }
        },
        methods: {
            randomName(len = 8) {
                const letters = "abcdefghijklmnopqrstuvwxyz";
                const range = letters.length;
                let result = "";
                for (let i = 0; i < len; i++) {
                    result += letters.charAt(Math.floor(Math.random() * range));
                }
                return result;
            },
            submitName(){
                this.$store.dispatch('check', this.name)
                    .then(() => this.$socket.emit('hello', this.name))
                    .then(() => this.$store.dispatch('login', this.name))
                    .catch(() => document.getElementById('login-name-field').focus)
            },
            check(){
                this.$store.dispatch('check', this.name).catch(console.log);
            }
        },
        created(){
            window.onbeforeunload = () => {
                this.$store.dispatch('logout')
                    .then((name) => this.$socket.emit('bye', name));
            };
        }
    }
</script>

<style scoped>
    .subtext{
        position: relative;
        top: -2em;
        left: 1em;
    }
</style>