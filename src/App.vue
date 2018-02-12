<template>
  <v-app>

    <v-navigation-drawer fixed :mini-variant="miniVariant" v-model="drawer" app>

      <v-toolbar flat class="toolbar-image" color="primary">
        <v-toolbar-side-icon class="white--text">
          <v-icon>person_pin</v-icon>
        </v-toolbar-side-icon>
        <v-toolbar-title class="white--text" v-text="loggedIn ? name: 'Menü'"></v-toolbar-title>
      </v-toolbar>

      <v-list class="pt-0">
        <transition name="flip">
        <v-list-tile class="avatar-bg" v-if="loggedIn && !miniVariant">
              <v-list-tile-content class="ma-0 pa-0">
                <span class="image-container">
                  <img :src="avatar" class="image"/>
                </span>
              </v-list-tile-content>
        </v-list-tile>
        </transition>
        <v-list-tile @click="go('/')">
          <v-list-tile-action>
            <v-icon>home</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>Start</v-list-tile-content>
        </v-list-tile>
        <v-list-tile @click="go('About')">
          <v-list-tile-action>
            <v-icon>info</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>Info</v-list-tile-content>
        </v-list-tile>
        <v-list-tile @click="logout" v-if="loggedIn">
          <v-list-tile-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>Abmelden</v-list-tile-content>
        </v-list-tile>

        <v-divider/>

        <v-list-tile  v-for="(item, i) in items" :key="i" value="true" @click="go('/call/'+item)" class="nav-item">
          <v-list-tile-action>
            <avatar :name="item" :size="35"/>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              {{item}}
            </v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-avatar>
            <v-chip class="state-icon white--text" color="primary" small v-if="isCallstateOf(item, ['ringing', 'picking', 'call'])">...<v-icon>call</v-icon></v-chip>
          </v-list-tile-avatar>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <v-toolbar app flat color="primary" dark>
      <v-btn icon @click.stop="miniVariant = !miniVariant">
        <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'" class="white--text"/>
      </v-btn>
      <v-toolbar-title v-text="title" class="white--text"/>
    </v-toolbar>

    <v-content>
      <v-container fluid fill-height>
        <v-slide-y-transition mode="out-in">
          <v-layout row>
            <router-view></router-view>
          </v-layout>
        </v-slide-y-transition>
      </v-container>
    </v-content>

  </v-app>
</template>

<script>

  import Avatar from './components/Avatar'

  export default {
    data () {
      return {
        drawer: true,
        miniVariant: false,
      }
    },
    components: {
        Avatar
    },
    computed: {
        loggedIn(){
            return this.$store.state.auth.loggedIn;
        },
        avatar(){
            return this.$store.state.auth.avatar;
        },
        name(){
            return this.$store.state.auth.name;
        },
        title(){
            let title = 'WebRTC Demo';
            if(this.$route && this.$route.params.id){
                title += ' - verbunden mit '+this.$route.params.id;
            }
            return title;
        },
        items(){
            if(!this.$store.state.auth.loggedIn){
                return [];
            }else{
                return this.$store.getters.users;
            }
        }
    },
    methods: {
        go(route){
            this.$router.push(route);
        },
        logout(){
            this.$store.dispatch('logout')
                .then(name => this.$socket.emit('bye', name))
                .then(() => this.$store.getters.users.forEach(user => this.$store.dispatch('clear', {user})));
            this.$router.push('/');
        },
        callstate(user){
            return this.$store.getters.call(user).state;
        },
        isCallstateOf(user, states){
            return states.indexOf(this.callstate(user)) >= 0;
        },
    }
  }
</script>

<style>
  .avatar-bg, .avatar-bg>*{
    margin: 0;
    padding: 0;
    height: 20vh
  }

  .image-container{
    position: relative;
    overflow: hidden;
    height: 100%;
    width: 100%
  }

  .image{
    position: absolute;
    transform: scale(1.8) translateX(2vw) rotate(20deg);
  }

  .flip-enter-active, .flip-leave-active {
    transition: height .1s;
  }

  .flip-enter, .flip-leave-to /* .fade-leave-active below version 2.1.8 */ {
    height: 0;

  }

  .nav-item{
    cursor: pointer;
  }

  .state-item{
    max-height: 2em;
  }
</style>