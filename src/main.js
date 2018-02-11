require('../node_modules/vuetify/src/stylus/app.styl');
import Vue from 'vue'
import VueRouter from 'vue-router'
import VueSocket from 'vue-socket.io'
import App from './App.vue'
import router from './router'
import store from './store'
import {
  Vuetify,
  VApp,
  VNavigationDrawer,
  VFooter,
  VList,
  VBtn,
  VIcon,
  VGrid,
  VToolbar,
  VCard,
  VForm,
  VTextField,
  VCheckbox,
  VDivider,
  VAvatar,
  VChip,
  transitions
} from 'vuetify'

Vue.use(VueRouter);
Vue.use(VueSocket, /*document.origin*/'http://localhost:3000'+'/', store);
Vue.use(Vuetify, {
  components: {
    VApp,
    VNavigationDrawer,
    VFooter,
    VList,
    VBtn,
    VIcon,
    VGrid,
    VToolbar,
    VCard,
    VForm,
    VTextField,
    VCheckbox,
    VDivider,
    VAvatar,
    VChip,
    transitions
  },
  theme: {
    primary: '#4976d7',
    secondary: '#fafafa',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107'
  }
});

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
});
