import { createRouter, createWebHistory } from 'vue-router';
import SearchRecipes from '../components/SearchRecipes.vue';
import RecipeDetail from '../components/RecipeDetail.vue'; 

const routes = [
    { path: '/', component: SearchRecipes },
    { path: '/recipe/:id', component: RecipeDetail, props: true }, // New dynamic route
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
