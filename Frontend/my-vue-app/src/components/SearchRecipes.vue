<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const query = ref(sessionStorage.getItem('searchQuery') || '');
const recipes = ref<any[]>(JSON.parse(sessionStorage.getItem('searchResults') || '[]'));

const resultsPerPage = 10;
const columnsPerRow = 5;

const currentPage = ref(parseInt(route.params.pageNumber as string) || 1);

const maxDescriptionLength = 100;
const maxTitleLength = 40;

const errorMessage = ref('');

const loggedInUsername = ref<string | null>(null);

onMounted(() => {
  const storedUsername = localStorage.getItem('username');
  if (storedUsername) {
    loggedInUsername.value = storedUsername;
  } else {
    router.push('/login');
    return;
  }
  if (query.value && recipes.value.length === 0) {
    searchRecipes();
  }
});

// Fetch from /search
const searchRecipes = async () => {
  if (!loggedInUsername.value) {
    router.push('/login');
    return;
  }
  if (!query.value) return;

  try {
    const response = await axios.get(`http://127.0.0.1:5000/search?q=${query.value}`);
    recipes.value = response.data.results;
    sessionStorage.setItem('searchQuery', query.value);
    sessionStorage.setItem('searchResults', JSON.stringify(recipes.value));
    sessionStorage.setItem('currentPage', currentPage.value.toString());
  } catch (error) {
    errorMessage.value = 'Error fetching recipes.';
    console.error('Error fetching recipes:', error);
  }
};

// Get the current page slice
const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * resultsPerPage;
  return recipes.value.slice(start, start + resultsPerPage);
});

// Split paginatedResults into rows
const chunkedResults = computed(() => {
  const chunks = [];
  for (let i = 0; i < paginatedResults.value.length; i += columnsPerRow) {
    chunks.push(paginatedResults.value.slice(i, i + columnsPerRow));
  }
  return chunks;
});

// Truncate helper
const truncateText = (text: string, limit: number) => {
  return text.length > limit ? text.substring(0, limit) + '...' : text;
};

// Pagination
const changePage = (step: number) => {
  currentPage.value += step;
  sessionStorage.setItem('currentPage', currentPage.value.toString());
  router.push(`/page/${currentPage.value}`);
};

// Logout
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

// Watch route changes to update currentPage
watch(() => route.params.pageNumber, (newPage) => {
  if (newPage) {
    currentPage.value = parseInt(newPage as string);
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
    <h1>Recipe Search</h1>
    <div class="search-bar">
      <input v-model="query" type="text" placeholder="Search for recipes..." />
      <button @click="searchRecipes">Search</button>
    </div>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <div class="results">
      <!-- Loop over each "row" of chunkedResults -->
      <div class="recipe-row" v-for="(row, rowIndex) in chunkedResults" :key="rowIndex">
        <!-- Loop over each recipe in this row -->
        <router-link
          v-for="recipe in row"
          :key="recipe.recipe_id"
          :to="`/recipe/${recipe.recipe_id}`"
          class="recipe-card"
        >
          <img
            :src="Array.isArray(recipe.image_url) ? recipe.image_url[0] : recipe.image_url"
            :alt="recipe.name"
          />
          <div class="recipe-details">
            <h3 class="recipe-title">
              {{ truncateText(recipe.name, maxTitleLength) }}
            </h3>
            <p class="recipe-description">
              <span class="short-text">
                {{ truncateText(recipe.description, maxDescriptionLength) }}
              </span>
            </p>
            <p class="recipe-calories">
              <strong>Calories:</strong> {{ recipe.calories }} |
              <strong>Rating:</strong> ⭐
              {{ recipe.rating > 0 ? recipe.rating.toFixed(1) : 'N/A' }}
            </p>
          </div>
        </router-link>
      </div>
    </div>

    <div v-if="recipes.length > 0" class="pagination">
      <button
        @click="changePage(-1)"
        :disabled="currentPage === 1"
        class="pagination-button"
      >
        Previous
      </button>
      <span>Page {{ currentPage }}</span>
      <button
        @click="changePage(1)"
        :disabled="(currentPage * resultsPerPage) >= recipes.length"
        class="pagination-button"
      >
        Next
      </button>
    </div>
  </div>
</template>

<style scoped>
body {
  margin: 0;
  padding: 0;
}

/* Container */
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

.short-text {
  display: inline;
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
</style>
