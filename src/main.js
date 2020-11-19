import Vue from 'vue'
import App from './App.vue'
import 'view-design/dist/styles/iview.css';
import '_file-icon-vectors@1.0.0@file-icon-vectors/dist/file-icon-vivid.css'
import axios from "axios";
import  './iview'
Vue.prototype.$axios = axios
Vue.config.productionTip = false
axios.defaults.baseURL = "/api"
new Vue({
  render: h => h(App),
}).$mount('#app')
