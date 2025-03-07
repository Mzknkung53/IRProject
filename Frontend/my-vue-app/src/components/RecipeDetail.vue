<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const recipe = ref<any>(null);

const fetchRecipeDetails = async (recipeId: string) => {
    recipe.value = null; // Reset state before fetching new data
    try {
        const response = await axios.get(`http://127.0.0.1:5000/recipe/${recipeId}`);
        recipe.value = response.data;
    } catch (error) {
        console.error('Error fetching recipe details:', error);
    }
};

// Fetch when component is mounted
onMounted(() => {
    fetchRecipeDetails(route.params.id as string);
});

// Watch for route changes and refetch
watch(() => route.params.id, (newId) => {
    if (newId) {
        fetchRecipeDetails(newId as string);
    }
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
        <ul v-if="recipe.instructions && recipe.instructions.length > 0">
            <li v-for="(step, index) in recipe.instructions.split('. ') || []" :key="index">
                {{ step }}
            </li>
        </ul>
        <p v-else>No instructions available.</p>



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
    width: 50%; 
    max-width: 250px; 
    max-height: 200px; 
    height: auto; 
    object-fit: cover; 
    border-radius: 10px;
    display: block;
    margin: 15px auto; 
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
