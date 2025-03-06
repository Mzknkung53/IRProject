<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const recipe = ref<any>(null);

const fetchRecipeDetails = async () => {
    try {
        const response = await axios.get(`http://127.0.0.1:5000/recipe/${route.params.id}`);
        recipe.value = response.data;
    } catch (error) {
        console.error('Error fetching recipe details:', error);
    }
};

onMounted(() => {
    fetchRecipeDetails();
});
</script>

<template>
    <div v-if="recipe" class="recipe-detail">
        <h1>{{ recipe.name }}</h1>
        <img :src="recipe.image_url" alt="Recipe Image" class="recipe-image">
        <p><strong>Description:</strong> {{ recipe.description }}</p>
        <p><strong>Calories:</strong> {{ recipe.calories }}</p>
        <p><strong>Rating:</strong> ⭐ {{ recipe.rating > 0 ? recipe.rating.toFixed(1) : "N/A" }}</p>

        <h3>Instructions</h3>
        <ul>
            <li v-for="(step, index) in recipe.instructions.split('. ')" :key="index">{{ step }}</li>
        </ul>

        <button @click="router.push('/')">Back to Search</button>
    </div>
    <div v-else>
        <p>Loading recipe details...</p>
    </div>
</template>

<style scoped>
.recipe-detail {
    max-width: 800px;
    margin: auto;
    text-align: center;
}
.recipe-image {
    width: 100%;
    max-height: 400px;
    object-fit: cover;
    border-radius: 10px;
}
button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: red;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}
button:hover {
    background-color: darkred;
}
</style>
