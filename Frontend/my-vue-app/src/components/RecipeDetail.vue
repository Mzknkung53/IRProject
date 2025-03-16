<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const recipe = ref<any>(null);
const showBookmarkModal = ref(false);
const folderName = ref('');
const rating = ref(5);
const successMessage = ref('');
const errorMessage = ref('');

// Fetch recipe details from backend
const fetchRecipeDetails = async (recipeId: string) => {
  recipe.value = null;
  try {
    const response = await axios.get(`http://127.0.0.1:5000/recipe/${recipeId}`);
    recipe.value = response.data;
  } catch (error) {
    console.error('Error fetching recipe details:', error);
  }
};

onMounted(() => {
  fetchRecipeDetails(route.params.id as string);
});

watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchRecipeDetails(newId as string);
  }
});

// Toggle Bookmark Modal
const toggleBookmarkModal = () => {
  showBookmarkModal.value = !showBookmarkModal.value;
  if (showBookmarkModal.value) {
    successMessage.value = '';
    errorMessage.value = '';
    folderName.value = '';
    rating.value = 5;
  }
};

// POST to /bookmark
const addBookmark = async () => {
  if (!recipe.value) return;
  if (!folderName.value.trim()) {
    errorMessage.value = 'Folder name is required.';
    return;
  }
  try {
    const payload = {
      recipe_id: recipe.value.recipe_id,
      folder_name: folderName.value.trim(),
      rating: rating.value
    };
    const token = localStorage.getItem('token');

    const response = await axios.post('http://127.0.0.1:5000/bookmark', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    successMessage.value = response.data.message || 'Bookmark added!';
    errorMessage.value = '';
  } catch (err: any) {
    errorMessage.value = err.response?.data?.error || 'Error adding bookmark.';
    console.error('Bookmark error:', err);
  }
};

// Close modal on overlay click
const closeModalIfOverlayClicked = (event: MouseEvent) => {
  if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
    showBookmarkModal.value = false;
  }
};
</script>

<template>
  <!-- Back Button fixed top-left -->
  <button class="back-button-fixed" @click="router.push('/')">← Back</button>

  <div v-if="recipe" class="recipe-detail-container">
    <!-- Recipe Image Section -->
    <div class="card section-image">
      <img :src="recipe.image_url" alt="Recipe Image" class="recipe-image" />
    </div>

    <!-- Recipe Info Section -->
    <div class="card section-info">
      <h1 class="recipe-title">{{ recipe.name }}</h1>
      <div class="info-row">
        <p><strong>Rating:</strong> ⭐ {{ recipe.rating > 0 ? recipe.rating.toFixed(1) : "N/A" }}</p>
        <p><strong>Calories:</strong> {{ recipe.calories }}</p>
      </div>
    </div>

    <!-- Description Section -->
    <div class="card section-description">
      <p>{{ recipe.description }}</p>
    </div>

    <!-- Instructions Section -->
    <div class="card section-instructions">
      <h2>Instructions</h2>
      <ul v-if="recipe.instructions && recipe.instructions.length > 0" class="instructions-list">
        <li v-for="(step, index) in recipe.instructions.split('. ') || []" :key="index">
          {{ step }}
        </li>
      </ul>
      <p v-else>No instructions available.</p>
    </div>

    <!-- Bookmark Button Section -->
    <div class="bookmark-section">
      <button class="bookmark-button" @click="toggleBookmarkModal">Bookmark This Recipe</button>
    </div>

    <!-- Bookmark Modal -->
    <div v-if="showBookmarkModal" class="modal-overlay" @click="closeModalIfOverlayClicked">
      <div class="modal-content" @click.stop>
        <h2>Add Bookmark</h2>
        <div class="form-group">
          <label>Folder Name</label>
          <input type="text" v-model="folderName" placeholder="Enter folder name" />
        </div>

        <div class="form-group">
          <label>Rating</label>
          <select v-model="rating">
            <option v-for="n in 5" :key="n" :value="n">{{ n }} Star{{ n > 1 ? 's' : '' }}</option>
          </select>
        </div>

        <p v-if="successMessage" class="success">{{ successMessage }}</p>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <div class="modal-buttons">
          <button class="cancel" @click="toggleBookmarkModal">Cancel</button>
          <button class="save" @click="addBookmark">Save</button>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="loading-message">
    <p>Loading recipe details...</p>
  </div>
</template>

<style scoped>
/* Container */
.recipe-detail-container {
  max-width: 800px;
  margin: 60px auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
  color: #333;
}

/* Card style for each section */
.card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Back Button Fixed Top-Left */
.back-button-fixed {
  position: fixed;
  top: 20px;
  left: 20px;
  background-color: #f44336;
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  z-index: 1000;
}

.back-button-fixed:hover {
  background-color: #c62828;
}

/* Image Styling */
.section-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.recipe-image {
  width: 100%;
  max-width: 400px;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Title and Info */
.section-info {
  text-align: center;
}

.recipe-title {
  font-size: 1.8rem;
  margin-bottom: 10px;
  color: #2c3e50;
}

.info-row {
  display: flex;
  justify-content: center;
  gap: 30px;
  font-size: 1rem;
}

/* Description */
.section-description {
  font-size: 1rem;
  color: #555;
  text-align: center;
}

/* Instructions */
.section-instructions h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #2c3e50;
}

.instructions-list {
  padding-left: 20px;
  color: #444;
  line-height: 1.6;
}

.instructions-list li {
  margin-bottom: 10px;
}

/* Bookmark Button */
.bookmark-section {
  text-align: center;
}

.bookmark-button {
  background-color: #f44336;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
}

.bookmark-button:hover {
  background-color: #c62828;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: white;
  padding: 25px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  text-align: left;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.modal-content h2 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.success {
  color: green;
  text-align: center;
  margin-top: 10px;
}

.error {
  color: red;
  text-align: center;
  margin-top: 10px;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.cancel,
.save {
  padding: 10px;
  width: 45%;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.cancel {
  background-color: #757575;
  color: white;
}

.cancel:hover {
  background-color: #5a5a5a;
}

.save {
  background-color: #f44336;
  color: white;
}

.save:hover {
  background-color: #c62828;
}

/* Loading */
.loading-message {
  text-align: center;
  padding: 50px;
  font-size: 1.2rem;
}
</style>
