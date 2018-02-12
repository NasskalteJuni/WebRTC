<template>
    <v-flex xs10 offset-xs1>
        <login v-if="!loggedIn"/>
        <v-layout fill-height align-center justify-center v-else row wrap>
            <v-flex xs10 offset-xs1>
                <v-icon class="display-4 header-icon">contact_phone</v-icon> <h2 class="header-text ml-4"> Nutze jetzt WebRTC! </h2>
            </v-flex>
            <v-flex xs12>
                <v-spacer/>
            </v-flex>
            <v-flex xs10 offset-xs1>
                <p class="subheading"> <v-avatar class="primary white--text"><span>1.</span></v-avatar> &nbsp; Gehe auf die linke Seite (Navigation) </p>
            </v-flex>
            <v-flex xs10 offset-xs1>
                <p class="subheading"> <v-avatar class="primary white--text"><span>2.</span></v-avatar> &nbsp; Wähle einen Nutzer aus </p>
            </v-flex>
            <v-flex xs10 offset-xs1>
                <p class="subheading"> <v-avatar class="primary white--text"><span>3.</span></v-avatar> &nbsp; Fange an zu telephonieren </p>
            </v-flex>
        </v-layout>
    </v-flex>
</template>

<script>
    import Login from './Login'

    export default {
        name: "start",
        components: {
            Login
        },
        computed: {
            loggedIn(){
                return this.$store.state.auth.loggedIn;
            }
        }
    }
</script>

<style scoped>
    .header-icon, .header-text{
        display: inline;
    }
</style>