import Vue from 'vue'
import App from './App.vue'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'
import * as VueGoogleMaps from 'vue2-google-maps'
import VueRouter from 'vue-router'
import ListeRestaurants from './components/ListeRestaurants.vue'
import Restaurant from './components/Restaurant.vue'

Vue.config.productionTip = false
Vue.use(VueMaterial)
Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    {
      path: '/',
      component: ListeRestaurants
    },
    {
      path: '/restaurant/:id',
      component: Restaurant
    },
  ],
  mode: 'history'
});

Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyAi5Vi3-s_9g2b_0V8RgE41aGsuzAyL9k8',
    libraries: 'places', // This is required if you use the Autocomplete plugin
    // OR: libraries: 'places,drawing'
    // OR: libraries: 'places,drawing,visualization'
    // (as you require)

    //// If you want to set the version, you can do so:
    // v: '3.26',
  },
}),

  new Vue({
    router,
    render: h => h(App),
  }).$mount('#app')
