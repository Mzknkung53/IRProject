<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import RecipeDetail from './RecipeDetail.vue'; // Import your modal

const route = useRoute();
const router = useRouter();

const query = ref(sessionStorage.getItem('searchQuery') || '');
const recipes = ref<any[]>(JSON.parse(sessionStorage.getItem('searchResults') || '[]'));
const recommendations = ref<any[]>([]);
const topSearches = ref<any[]>([]);

const resultsPerPage = 10;
const columnsPerRow = 5;
const totalRecipesCount = ref(0);
const currentPage = ref(parseInt(route.params.pageNumber as string) || 1);
const maxDescriptionLength = 100;
const maxTitleLength = 40;
const errorMessage = ref('');
const loggedInUsername = ref<string | null>(null);
const suggestedQuery = ref('');
const showSuggestion = computed(() => !!suggestedQuery.value);

// --- Modal Logic ---
const showModal = ref(false);
const modalId = ref<string | null>(null);

// Watch for modal query param
watch(() => route.query.modal, (newModalId) => {
  if (newModalId) {
    modalId.value = newModalId as string;
    showModal.value = true;
  } else {
    showModal.value = false;
    modalId.value = null;
  }
});

// Get valid image URL
const getImageUrl = (image: string | string[]) => {
  if (!image) return "https://via.placeholder.com/150";
  if (Array.isArray(image)) {
    return image.length > 0 ? image[0] : "https://via.placeholder.com/150";
  }
  return image;
};

const maxAllowedPages = computed(() => {
  return Math.min(
    Math.ceil(totalRecipesCount.value / resultsPerPage),
    Math.floor(100000 / resultsPerPage)
  );
});

// Clear Search
const clearSearch = () => {
  query.value = '';
  recipes.value = [];
  totalRecipesCount.value = 0;
  sessionStorage.removeItem('searchQuery');
  sessionStorage.removeItem('searchResults');
  sessionStorage.removeItem('currentPage');
};

// Compute whether to show recommendations
const recommendedDisplay = computed(() => {
  if (!query.value) return recommendations.value;
  return [];
});

// Fetch Top Searches
const fetchTopSearches = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:5000/top-searches');
    topSearches.value = response.data.top_searches || [];
  } catch (error) {
    console.error("Error fetching top searches:", error);
  }
};

const searchFromTopQuery = (queryStr: string) => {
  query.value = queryStr;
  searchRecipes();
};

// Fetch Recommendations
const fetchRecommendations = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://127.0.0.1:5000/recommendations', {
      headers: { Authorization: `Bearer ${token}` }
    });
    recommendations.value = response.data.recommendations || [];
  } catch (error) {
    console.error("Error fetching recommendations:", error);
  }
};

// Search Recipes from backend
const searchRecipes = async () => {
  if (!loggedInUsername.value) {
    router.push('/login');
    return;
  }
  if (!query.value) return;

  try {
    const response = await axios.get(`http://127.0.0.1:5000/search?q=${query.value}&page=${currentPage.value}`);
    recipes.value = response.data.results;
    totalRecipesCount.value = response.data.total_count;
    suggestedQuery.value = response.data.suggested_query || '';
    errorMessage.value = '';

    sessionStorage.setItem('searchQuery', query.value);
    sessionStorage.setItem('searchResults', JSON.stringify(recipes.value));
    sessionStorage.setItem('currentPage', currentPage.value.toString());
  } catch (error: any) {
    recipes.value = [];
    totalRecipesCount.value = 0;
    if (error.response?.data?.suggested_query) {
      suggestedQuery.value = error.response.data.suggested_query;
    } else {
      suggestedQuery.value = '';
    }
    errorMessage.value = error.response?.data?.error || 'Error fetching recipes.';
  }
};

const useSuggestedQuery = () => {
  query.value = suggestedQuery.value;
  suggestedQuery.value = '';
  errorMessage.value = '';
  searchRecipes();
};

const ignoreSuggestion = () => {
  suggestedQuery.value = '';
  errorMessage.value = '';
};

const chunkedResults = computed(() => {
  const chunks = [];
  for (let i = 0; i < recipes.value.length; i += columnsPerRow) {
    chunks.push(recipes.value.slice(i, i + columnsPerRow));
  }
  return chunks;
});

const truncateText = (text: string, limit: number) => {
  return text.length > limit ? text.substring(0, limit) + '...' : text;
};

const changePage = (step: number) => {
  const newPage = currentPage.value + step;
  const maxPages = maxAllowedPages.value;

  if (newPage < 1 || newPage > maxPages) return;

  currentPage.value = newPage;
  sessionStorage.setItem('currentPage', currentPage.value.toString());

  router.push(`/page/${newPage}`);
};

const logout = async () => {
  try {
    const token = localStorage.getItem('token');
    await axios.post('http://127.0.0.1:5000/logout', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    loggedInUsername.value = null;
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Watch route page changes
watch(() => route.params.pageNumber, (newPage) => {
  if (newPage) {
    currentPage.value = parseInt(newPage as string);
    searchRecipes();
  }
});

// On mount
onMounted(() => {
  const storedUsername = localStorage.getItem('username');
  if (storedUsername) {
    loggedInUsername.value = storedUsername;
  } else {
    router.push('/login');
    return;
  }
  fetchRecommendations();
  fetchTopSearches();
  if (query.value && recipes.value.length === 0) {
    searchRecipes();
  }
});
</script>

<template>
  <nav class="navbar">
    <router-link class="nav-item bookmarks" to="/bookmarks">
      <img src="../assets/Star.png" alt="Bookmarks" class="icon" />
      Bookmarks
    </router-link>
    <div v-if="loggedInUsername" class="user-controls">
      <span class="nav-item username">
        <img src="../assets/LoginIcon.jpg" alt="User Icon" class="icon" />
        {{ loggedInUsername }}
      </span>
      <button class="logout-button" @click="logout">Logout</button>
    </div>
    <router-link v-else class="nav-item login" to="/login">
      <img src="../assets/LoginIcon.jpg" alt="Login Icon" class="icon" />
      Login
    </router-link>
  </nav>

  <div class="container">
    <!-- 🔍 Search Bar -->
    <div class="search-bar">
      <input v-model="query" type="text" placeholder="Search for recipes..." />
      <button @click="searchRecipes">Search</button>
      <button class="clear-button" @click="clearSearch">Clear</button>
    </div>

    <!-- 🔥 Top 5 Searches -->
    <section v-if="topSearches.length && !query" class="top-searches-section">
      <h2>Top Searches</h2>
      <ul class="top-search-list">
        <li v-for="item in topSearches" :key="item.query">
          <button class="top-search-button" @click="searchFromTopQuery(item.query)">
            {{ item.query }} ({{ item.count }} times)
          </button>
        </li>
      </ul>
    </section>

    <!-- 🔥 Recommendations -->
    <section class="recommendations-section" v-if="recommendedDisplay.length">
      <h2>Recommended for You</h2>
      <button class="refresh-button" @click="fetchRecommendations">Refresh Recommendations</button>
      <div class="recommendation-grid">
        <div v-for="rec in recommendedDisplay" :key="rec.recipe_id" class="recipe-card">
          <img :src="getImageUrl(rec.image_url)" :alt="rec.name" />
          <div class="recipe-details">
            <h3 class="recipe-title">{{ truncateText(rec.name, maxTitleLength) }}</h3>
            <p class="recipe-description">{{ truncateText(rec.description, maxDescriptionLength) }}</p>
            <p class="recipe-calories">
              <strong>Calories:</strong> {{ rec.calories }} |
              <strong>Rating:</strong> ⭐ {{ rec.rating > 0 ? rec.rating.toFixed(1) : 'N/A' }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 💡 Suggestions -->
    <div v-if="showSuggestion" class="suggestion-box">
      <p>
        Did you mean <span class="suggested-text">"{{ suggestedQuery }}"</span>?
      </p>
      <button @click="useSuggestedQuery">Use Suggestion</button>
      <button class="ignore-button" @click="ignoreSuggestion">Ignore</button>
    </div>

    <!-- ❌ Error Message -->
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <!-- 🧾 Results Grid -->
    <div v-if="recipes.length > 0" class="results">
      <div class="recipe-row" v-for="(row, rowIndex) in chunkedResults" :key="rowIndex">
        <!-- ✅ Modal Trigger (router query) -->
        <router-link
          v-for="recipe in row"
          :key="recipe.recipe_id"
          :to="{ query: { ...$route.query, modal: recipe.recipe_id } }"
          class="recipe-card"
        >
          <img :src="getImageUrl(recipe.image_url)" :alt="recipe.name" />
          <div class="recipe-details">
            <h3 class="recipe-title">{{ truncateText(recipe.name, maxTitleLength) }}</h3>
            <p class="recipe-description">{{ truncateText(recipe.description, maxDescriptionLength) }}</p>
            <p class="recipe-calories">
              <strong>Calories:</strong> {{ recipe.calories }} |
              <strong>Rating:</strong> ⭐ {{ recipe.rating > 0 ? recipe.rating.toFixed(1) : 'N/A' }}
            </p>
          </div>
        </router-link>
      </div>
    </div>

    <!-- 📄 Pagination Controls -->
    <div v-if="recipes.length > 0" class="pagination">
      <button @click="changePage(-1)" :disabled="currentPage === 1" class="pagination-button">Previous</button>
      <span>Page {{ currentPage }}</span>
      <button
        @click="changePage(1)"
        :disabled="currentPage >= maxAllowedPages || (currentPage * resultsPerPage) >= totalRecipesCount"
        class="pagination-button"
      >
        Next
      </button>
    </div>
  </div>

  <!-- ✅ Modal Component Render -->
  <RecipeDetail v-if="showModal" :id="modalId" @close="router.push({ query: { ...$route.query, modal: undefined } })" />
</template>

<style scoped>
body {
  margin: 0;
  padding: 0;
}

/* Container */
.container {
  max-width: 1100px;
  margin: 80px auto 0 auto;
  /* 80px top margin to avoid fixed navbar overlap */
  text-align: center;
  padding: 0 20px;
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

/* Recommendations Section */
.recommendations-section {
  margin-bottom: 20px;
  text-align: left;
}

.refresh-button {
  display: inline-block;
  margin-bottom: 10px;
  padding: 8px 12px;
  border: none;
  background-color: red;
  color: white;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
}

.refresh-button:hover {
  background-color: darkred;
}

.recommendation-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.recommendation-grid .recipe-card {
  flex: 1 1 calc(20% - 20px);
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}

.recommendation-grid .recipe-card:hover {
  transform: scale(1.05);
}

.recommendation-grid .recipe-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.recommendation-grid .recipe-details {
  padding: 10px;
}

.recommendation-grid .recipe-title {
  font-size: 1.1em;
  font-weight: bold;
  margin-bottom: 5px;
}

.recommendation-grid .recipe-description {
  font-size: 0.9em;
  margin-bottom: 5px;
}

/* Results */
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

.recipe-card {
  text-decoration: none;
  color: inherit;
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

.recipe-card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-bottom: 2px solid #ddd;
}

.recipe-details {
  background: #f8f8f8;
  padding: 10px;
  min-height: 120px;
}

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

.recipe-description {
  position: relative;
  min-height: 60px;
  font-size: 14px;
  overflow: hidden;
}

/* Pagination */
.pagination {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

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
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 1000;
}

.nav-item.bookmarks {
  display: inline-flex;
  align-items: center;
  background-color: white;
  color: red;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 5px;
  font-weight: bold;
}

.nav-item.bookmarks .icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

.nav-item.bookmarks:hover {
  background-color: #f0f0f0;
}

.user-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-right: 2rem;
  /* moves user/logout left */
}

.username {
  display: inline-flex;
  align-items: center;
  background-color: white;
  color: red;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 5px;
  font-weight: bold;
}

.username .icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

.logout-button {
  background-color: white;
  color: red;
  border: 2px solid red;
  border-radius: 5px;
  font-weight: bold;
  padding: 8px 12px;
  cursor: pointer;
}

.logout-button:hover {
  background-color: #f0f0f0;
}

.nav-item.login {
  display: inline-flex;
  align-items: center;
  background-color: white;
  color: red;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 5px;
  font-weight: bold;
  margin-left: auto;
}

.nav-item.login .icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

.nav-item.login:hover {
  background-color: #f0f0f0;
}

.clear-button {
  background-color: gray;
}

.clear-button:hover {
  background-color: darkgray;
}

.suggestion-box {
  margin: 10px auto;
  padding: 10px;
  background-color: #fff8e1;
  border: 1px solid #ffd54f;
  border-radius: 5px;
  width: fit-content;
}

.suggested-text {
  font-weight: bold;
  color: #f57c00;
}

.ignore-button {
  background-color: gray;
  margin-left: 8px;
}

.ignore-button:hover {
  background-color: darkgray;
}

.top-searches-section {
  margin-bottom: 20px;
  text-align: left;
}

.top-search-list {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.top-search-button {
  background-color: white;
  color: red;
  border: 2px solid red;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.top-search-button:hover {
  background-color: red;
  color: white;
}
</style>
