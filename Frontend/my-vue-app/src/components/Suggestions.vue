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
      <router-link
        v-for="recipe in suggestions"
        :key="recipe.recipe_id"
        :to="`/recipe/${recipe.recipe_id}`"
        class="recipe-card"
      >
        <img :src="getImageUrl(recipe.image_url)" :alt="recipe.name" />
        <div class="recipe-details">
          <h3 class="recipe-title">{{ truncateText(recipe.name, maxTitleLength) }}</h3>
          <p class="recipe-description">{{ truncateText(recipe.description, maxDescriptionLength) }}</p>
          <p class="recipe-calories">
            <strong>Calories:</strong> {{ recipe.calories }}<br />
            <strong>Rating:</strong> ⭐ {{ recipe.rating > 0 ? recipe.rating.toFixed(1) : 'N/A' }}
          </p>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 80px auto 0 auto;
  text-align: center;
  padding: 0 20px;
}

.title {
  font-size: 2.5em;
  font-weight: bold;
  margin-bottom: 20px;
  background: linear-gradient(to right, #ff416c, #ff4b2b);
  -webkit-background-clip: text;
  color: transparent;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
}

.nav-button {
  background-color: #6c757d;
  color: white;
  border-radius: 8px;
  font-weight: bold;
  padding: 10px 20px;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s ease;
}

.nav-button:hover {
  background-color: #5a6268;
}

.nav-button.home {
  background-color: #28a745;
}

.nav-button.home:hover {
  background-color: #218838;
}

.loading {
  font-size: 1.2em;
  color: gray;
  margin-top: 20px;
}

.error {
  color: red;
  margin-top: 10px;
  font-weight: bold;
}

.suggestion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  justify-content: center;
}

.recipe-card {
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  position: relative;
}

.recipe-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.recipe-card img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.recipe-card:hover img {
  transform: scale(1.05);
}

.recipe-details {
  padding: 12px;
  text-align: left;
}

.recipe-title {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 6px;
}

.recipe-description {
  font-size: 0.95em;
  margin-bottom: 8px;
  color: #555;
}

.recipe-calories {
  font-size: 0.9em;
  color: #444;
}
</style>
