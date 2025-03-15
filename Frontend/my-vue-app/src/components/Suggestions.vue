<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

// Reactive variables
const suggestions = ref<any[]>([]);
const errorMessage = ref('');
const route = useRoute();

// Get folder ID from the query parameters (adjust as needed)
const folderId = ref<string>(route.query.folder_id as string || '');

// Function to fetch suggestions from the backend
const fetchSuggestions = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://127.0.0.1:5000/suggestions?folder_id=${folderId.value}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    suggestions.value = response.data.suggestions || [];
  } catch (err: any) {
    errorMessage.value = err.response?.data?.error || 'Failed to fetch suggestions.';
  }
};

// Function to refresh suggestions when button is clicked
const refreshSuggestions = () => {
  fetchSuggestions();
};

onMounted(() => {
  fetchSuggestions();
});
</script>

<template>
  <div class="suggestions-page">
    <h1>Suggestions</h1>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <button @click="refreshSuggestions" class="refresh-button">Refresh Suggestions</button>
    <div v-if="suggestions.length > 0" class="suggestions-list">
      <div v-for="suggestion in suggestions" :key="suggestion.recipe_id" class="suggestion-card">
        <img
          :src="Array.isArray(suggestion.image_url) ? suggestion.image_url[0] : suggestion.image_url || 'https://via.placeholder.com/150'"
          alt="Recipe Image"
        />
        <div class="suggestion-details">
          <h3>{{ suggestion.name }}</h3>
          <p>Calories: {{ suggestion.calories }}</p>
          <p>Rating: {{ suggestion.rating }}</p>
          <p>Score: {{ suggestion.score }}</p>
        </div>
      </div>
    </div>
    <div v-else>
      <p>No suggestions available.</p>
    </div>
  </div>
</template>

<style scoped>
.suggestions-page {
  max-width: 1100px;
  margin: 80px auto;
  text-align: center;
  padding: 20px;
}

.refresh-button {
  padding: 10px 15px;
  background-color: red;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 20px;
}

.refresh-button:hover {
  background-color: darkred;
}

.error-message {
  color: red;
  margin-bottom: 20px;
}

.suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.suggestion-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  width: 200px;
  text-align: left;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
}

.suggestion-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.suggestion-details {
  padding: 10px;
}
</style>
