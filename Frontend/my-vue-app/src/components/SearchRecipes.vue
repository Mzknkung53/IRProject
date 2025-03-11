<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const query = ref(sessionStorage.getItem('searchQuery') || '');
const recipes = ref<any[]>(JSON.parse(sessionStorage.getItem('searchResults') || '[]'));
const currentPage = ref(parseInt(sessionStorage.getItem('currentPage') || '1'));
const resultsPerPage = 10;
const columnsPerRow = 5;
const maxDescriptionLength = 100;
const maxTitleLength = 40;

const searchRecipes = async () => {
    if (!query.value) return;
    try {
        const response = await axios.get(`http://127.0.0.1:5000/search?q=${query.value}`);
        recipes.value = response.data.results;

        // ✅ Save query and results in sessionStorage
        sessionStorage.setItem('searchQuery', query.value);
        sessionStorage.setItem('searchResults', JSON.stringify(recipes.value));
        sessionStorage.setItem('currentPage', currentPage.value.toString());
    } catch (error) {
        console.error('Error fetching recipes:', error);
    }
};

// Restore previous search on component mount
onMounted(() => {
    if (query.value && recipes.value.length === 0) {
        searchRecipes();
    }
});

// Compute paginated results
const paginatedResults = computed(() => {
    const start = (currentPage.value - 1) * resultsPerPage;
    return recipes.value.slice(start, start + resultsPerPage);
});

// Function to shorten long descriptions
const truncateText = (text: string, limit: number) => {
    return text.length > limit ? text.substring(0, limit) + "..." : text;
};

// Change page function for pagination
const changePage = (step: number) => {
    currentPage.value += step;
    sessionStorage.setItem('currentPage', currentPage.value.toString()); // ✅ Save current page
};
</script>

<template>
    <!-- Navigation Bar -->
    <nav class="navbar">
        <!-- Bookmarks (icon + text, no box) -->
        <span class="nav-item bookmarks">
            <img src="../assets/Star.png" alt="Bookmarks" class="icon" />
            Bookmarks
        </span>

        <!-- Login (icon + text, boxed style) -->
        <router-link class="nav-item login" to="/login">
            <img src="../assets/LoginIcon.jpg" alt="Login Icon" class="icon" />
            Login
        </router-link>
    </nav>

    <div class="container">
        <h1>Recipe Search</h1>
        <div class="search-bar">
            <input v-model="query" type="text" placeholder="Search for recipes...">
            <button @click="searchRecipes">Search</button>
        </div>

        <div class="results">
            <div class="recipe-row" v-for="(row, index) in Math.ceil(paginatedResults.length / columnsPerRow)"
                :key="index">
                <router-link :to="`/recipe/${recipe.recipe_id}`" class="recipe-card" v-for="recipe in paginatedResults"
                    :key="recipe.recipe_id">
                    <img :src="Array.isArray(recipe.image_url) ? recipe.image_url[0] : recipe.image_url"
                        :alt="recipe.name">
                    <div class="recipe-details">
                        <h3 class="recipe-title">
                            {{ truncateText(recipe.name, maxTitleLength) }}
                        </h3>
                        <p class="recipe-description">
                            <span class="short-text">{{ truncateText(recipe.description, maxDescriptionLength) }}</span>
                        </p>
                        <p class="recipe-calories">
                            <strong>Calories:</strong> {{ recipe.calories }} |
                            <strong>Rating:</strong> ⭐ {{ recipe.rating > 0 ? recipe.rating.toFixed(1) : "N/A" }}
                        </p>
                    </div>
                </router-link>
            </div>
        </div>

        <div v-if="recipes.length > 0" class="pagination">
            <button @click="changePage(-1)" :disabled="currentPage === 1" class="pagination-button">Previous</button>
            <span>Page {{ currentPage }}</span>
            <button @click="changePage(1)" :disabled="(currentPage * resultsPerPage) >= recipes.length"
                class="pagination-button">Next</button>
        </div>
    </div>
</template>

<style scoped>
body {
    margin: 0;
    padding: 0;
}

/* Center container */
.container {
    max-width: 1100px;
    margin: 0 auto;
    text-align: center;
}

/* Search Bar */
.search-bar {
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
    gap: 10px;
}

input {
    padding: 10px;
    width: 300px;
    border: 1px solid #ddd;
    border-radius: 5px;
}

/* Style Search Button */
button {
    padding: 10px 15px;
    cursor: pointer;
    background-color: red;
    color: white;
    border: none;
    border-radius: 5px;
    font-family: "Arial", sans-serif;
    font-weight: bold;
}

button:hover {
    background-color: darkred;
}

/* Recipe Grid */
.results {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.recipe-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
}

/* Recipe Card */
.recipe-card {
    text-decoration: none;
    /* Removes link underline */
    color: inherit;
    /* Keeps text color the same */
    border: 1px solid #ddd;
    padding: 0;
    background: #fff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease-in-out;
    cursor: pointer;
}

.recipe-card:hover {
    transform: scale(1.05);
}

/* Image Styling - Expanded */
img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    border-bottom: 2px solid #ddd;
}

/* Recipe Details - Background */
.recipe-details {
    background: #f8f8f8;
    padding: 10px;
    min-height: 120px;
}

/* Make all text sections the same height */
.recipe-title {
    font-size: 1.2em;
    font-weight: bold;
    min-height: 50px;
    max-height: 50px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
}

/* Description with Hover Animation */
.recipe-description {
    position: relative;
    min-height: 60px;
    font-size: 14px;
    text-overflow: ellipsis;
    overflow: hidden;
}

/* Short text (truncated version) */
.short-text {
    display: inline;
}

/* Full text (hidden by default) */
.full-text {
    display: none;
    position: absolute;
    left: 50%;
    top: 100%;
    transform: translateX(-50%);
    width: 250px;
    background: white;
    padding: 10px;
    border: 1px solid #ddd;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    z-index: 10;
}

/* Show full text on hover */
.recipe-description:hover .full-text {
    display: block;
}

/* Pagination - Fixed positioning */
.pagination {
    margin-top: 40px;
    /* Extra space */
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
}

/* Pagination Button Styling */
.pagination-button {
    padding: 8px 15px;
    background-color: red;
    color: white;
    border: none;
    border-radius: 5px;
    font-weight: bold;
    cursor: pointer;
}

.pagination-button:hover {
    background-color: darkred;
}

/* NavBar */
.navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: red;
    padding: 15px;
    color: white;
    font-size: 18px;
    /* If you want it pinned at the very top:
     position: fixed;
     top: 0;
     width: 100%;
     z-index: 999;
  */
}

/* Generic nav items */
.nav-item {
    cursor: pointer;
}

/* Bookmarks (icon + text, no box) */
.bookmarks {
    display: inline-flex;
    align-items: center;
}

.bookmarks .icon {
    width: 20px;
    height: 20px;
    margin-right: 8px;
}

/* Login (icon + text, with box) */
.login {
    display: inline-flex;
    align-items: center;
    background-color: white;
    /* Box color */
    color: red;
    text-decoration: none;
    padding: 8px 12px;
    border-radius: 5px;
    font-weight: bold;
    margin-left: auto;
    /* Keep it on the far right if needed */
}

.login .icon {
    width: 20px;
    height: 20px;
    margin-right: 8px;
}

/* Hover effect for login button */
.login:hover {
    background-color: #f0f0f0;
}
</style>
