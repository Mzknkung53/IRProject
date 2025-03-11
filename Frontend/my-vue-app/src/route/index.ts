import { createRouter, createWebHistory } from 'vue-router'
import SearchRecipes from '../components/SearchRecipes.vue'
import RecipeDetail from '../components/RecipeDetail.vue'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'

const routes = [
  { path: '/', component: SearchRecipes },
  {
    path: '/recipe/:id',
    component: RecipeDetail,
    props: true,
    key: (route: { params: { id: any } }) => route.params.id
  },
  { path: '/login', component: Login },
  { path: '/register', component: Register }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
