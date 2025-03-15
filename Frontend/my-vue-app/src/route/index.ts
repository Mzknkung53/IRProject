import { createRouter, createWebHistory } from 'vue-router'
import SearchRecipes from '../components/SearchRecipes.vue'
import RecipeDetail from '../components/RecipeDetail.vue'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import Bookmarks from '../components/Bookmarks.vue'
import Suggestions from '../components/Suggestions.vue'  // New component for suggestions

const routes = [
  { path: '/', redirect: '/page/1' },
  { path: '/page/:pageNumber', component: SearchRecipes, props: true },
  { path: '/recipe/:id', component: RecipeDetail, props: true },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/bookmarks', component: Bookmarks },
  { path: '/suggestions', component: Suggestions, props: true }  // New route for suggestions
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
