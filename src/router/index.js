import Router from 'vue-router'
import Start from '../components/Start'
import Call from '../components/Call'
import About from '../components/About'

const routes = [
    {
        name: 'Start',
        path: '/',
        component: Start
    },
    {
        name: 'Call',
        path: '/call/:id',
        component: Call
    },
    {
        name: 'About',
        path: '/about',
        component: About
    }
];

const router = new Router({routes});


router.beforeEach((to, from, next) => {
    try{
        if(to.name === 'Call' && this.a.app.$store.state.auth.loggedIn && this.a.app.$store.getters.users.indexOf(to.params.id) < 0){
            next('/')
        }else{
            next();
        }
    }catch(err){
        console.error(err);
    }
});
router.onError(console.error);

export default router;