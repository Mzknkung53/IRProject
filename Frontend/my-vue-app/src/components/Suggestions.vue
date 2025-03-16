<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const folderId = route.params.folderId as string;
const suggestions = ref<any[]>([]);
const loading = ref(true);
const errorMessage = ref('');
const maxDescriptionLength = 100;
const maxTitleLength = 40;

// Truncate helper
const truncateText = (text: string, limit: number) => {
  return text.length > limit ? text.substring(0, limit) + '...' : text;
};

// Image helper
const getImageUrl = (image: string | string[]) => {
  if (!image) return "https://via.placeholder.com/150";
  if (Array.isArray(image)) {
    return image.length > 0 ? image[0] : "https://via.placeholder.com/150";
  }
  return image;
};

// Fetch suggestions
const fetchSuggestions = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/login');
    return;
  }

  try {
    const response = await axios.get(`http://127.0.0.1:5000/suggestions/${folderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    suggestions.value = response.data.suggestions || [];
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error || 'Failed to fetch suggestions.';
  } finally {
    loading.value = false;
  }
};

// Navigation buttons
const goBack = () => {
  router.push('/bookmarks');
};

const goHome = () => {
  router.push('/page/1');
};

onMounted(fetchSuggestions);
</script>

<template>
  <div class="container">
    <h2 class="title">Top Recommendations</h2>

    <!-- Buttons -->
    <div class="button-group">
      <button class="nav-button" @click="goBack">← Back to Bookmarks</button>
      <button class="nav-button home" @click="goHome">🏠 Home</button>
    </div>

    <!-- Loading / Error -->
    <div v-if="loading" class="loading">Loading suggestions...</div>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <!-- Suggestions Grid -->
    <div v-if="suggestions.length" class="suggestion-grid">
      <div v-for="recipe in suggestions" :key="recipe.recipe_id" class="recipe-card">
        <img :src="getImageUrl(recipe.image_url)" :alt="recipe.name" />
        <div class="recipe-details">
          <h3 class="recipe-title">{{ truncateText(recipe.name, maxTitleLength) }}</h3>
          <p class="recipe-description">{{ truncateText(recipe.description, maxDescriptionLength) }}</p>
          <p class="recipe-calories">
            <strong>Calories:</strong> {{ recipe.calories }}<br />
            <strong>Rating:</strong> ⭐ {{ recipe.rating > 0 ? recipe.rating.toFixed(1) : 'N/A' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1000px;
  margin: 80px auto 0 auto;
  text-align: center;
  padding: 0 20px;
}

.title {
  font-size: 2em;
  font-weight: bold;
  margin-bottom: 20px;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.nav-button {
  background-color: gray;
  color: white;
  border-radius: 5px;
  font-weight: bold;
  padding: 10px 15px;
  cursor: pointer;
  border: none;
}

.nav-button:hover {
  background-color: darkgray;
}

.nav-button.home {
  background-color: #007bff;
}

.nav-button.home:hover {
  background-color: #0056b3;
}

.loading {
  font-size: 1.2em;
  color: gray;
  margin-top: 20px;
}

.error {
  color: red;
  margin-top: 10px;
}

.suggestion-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.recipe-card {
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

.recipe-card:hover {
  transform: scale(1.05);
}

.recipe-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.recipe-details {
  padding: 10px;
  text-align: left;
}

.recipe-title {
  font-size: 1.1em;
  font-weight: bold;
  margin-bottom: 5px;
}

.recipe-description {
  font-size: 0.9em;
  margin-bottom: 5px;
}

.recipe-calories {
  font-size: 0.9em;
}
</style>
