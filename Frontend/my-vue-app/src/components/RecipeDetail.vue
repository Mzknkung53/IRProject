<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const recipe = ref<any>(null);

// Modal state and bookmark form fields
const showBookmarkModal = ref(false);
const folderName = ref('');
const rating = ref(5);
const successMessage = ref('');
const errorMessage = ref('');

// Fetch recipe details
const fetchRecipeDetails = async (recipeId: string) => {
  recipe.value = null; // Reset state before fetching new data
  try {
    const response = await axios.get(`http://127.0.0.1:5000/recipe/${recipeId}`);
    recipe.value = response.data;
  } catch (error) {
    console.error('Error fetching recipe details:', error);
  }
};

// Initialize on mount
onMounted(() => {
  fetchRecipeDetails(route.params.id as string);
});

// Refetch if route changes
watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchRecipeDetails(newId as string);
  }
});

// Show/hide the bookmark modal
const toggleBookmarkModal = () => {
  showBookmarkModal.value = !showBookmarkModal.value;
  // Reset any messages or input
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
  if (!folderName.value) {
    errorMessage.value = 'Folder name is required.';
    return;
  }
  try {
    const payload = {
      recipe_id: recipe.value.recipe_id,
      folder_name: folderName.value,
      rating: rating.value
    };
    const response = await axios.post('http://127.0.0.1:5000/bookmark', payload);
    successMessage.value = response.data.message || 'Bookmark added!';
    errorMessage.value = '';
  } catch (err: any) {
    errorMessage.value = err.response?.data?.error || 'Error adding bookmark.';
    console.error('Add Bookmark error:', err);
  }
};

// Optional: close modal if user clicks outside content
const closeModalIfOverlayClicked = (event: MouseEvent) => {
  // Only close if the user clicked directly on the overlay, not inside the modal
  if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
    showBookmarkModal.value = false;
  }
};
</script>

<template>
  <div v-if="recipe" class="recipe-detail">
    <h1>{{ recipe.name }}</h1>
    <img :src="recipe.image_url" alt="Recipe Image" class="recipe-image" />

    <p><strong>Rating:</strong> ⭐ {{ recipe.rating > 0 ? recipe.rating.toFixed(1) : "N/A" }}</p>
    <p><strong>Calories:</strong> {{ recipe.calories }}</p>
    <p><strong>Description:</strong> {{ recipe.description }}</p>

    <h3>Instructions</h3>
    <ul v-if="recipe.instructions && recipe.instructions.length > 0">
      <li v-for="(step, index) in recipe.instructions.split('. ') || []" :key="index">
        {{ step }}
      </li>
    </ul>
    <p v-else>No instructions available.</p>

    <!-- Button to show modal -->
    <button class="bookmark-button" @click="toggleBookmarkModal">
      Add to Bookmarks
    </button>

    <!-- 'Back to Search' remains separate -->
    <button class="back-button" @click="router.push('/')">
      Back to Search
    </button>

    <!-- Bookmark Modal -->
    <div 
      v-if="showBookmarkModal" 
      class="modal-overlay"
      @click="closeModalIfOverlayClicked"
    >
      <div class="modal-content">
        <h2>Add Bookmark</h2>
        <div class="form-group">
          <label for="folder">Folder Name</label>
          <input
            id="folder"
            type="text"
            v-model="folderName"
            placeholder="Enter folder name"
          />
        </div>

        <div class="form-group">
          <label for="rating">Rating</label>
          <select id="rating" v-model="rating">
            <option v-for="n in 5" :key="n" :value="n">
              {{ n }} Star{{ n > 1 ? 's' : '' }}
            </option>
          </select>
        </div>

        <!-- Success & Error messages -->
        <p v-if="successMessage" class="success-message">
          {{ successMessage }}
        </p>
        <p v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </p>

        <!-- Buttons row -->
        <div class="button-row">
          <button class="cancel-button" @click="toggleBookmarkModal">
            Cancel
          </button>
          <button class="save-button" @click="addBookmark">
            Save Bookmark
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-else>
    <p>Loading recipe details...</p>
  </div>
</template>

<style scoped>
/* Container styling */
.recipe-detail {
  max-width: 800px;
  margin: auto;
  text-align: center;
  padding: 20px;
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

/* Buttons outside the modal */
.bookmark-button,
.back-button {
  margin: 10px 5px;
  padding: 10px 20px;
  background-color: red;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.bookmark-button:hover,
.back-button:hover {
  background-color: darkred;
}

/* MODAL STYLES */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.6); /* semi-transparent overlay */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background-color: #fff;
  width: 90%;
  max-width: 400px;
  padding: 20px;
  border-radius: 8px;
  position: relative;
  text-align: left;
}

/* Headline inside the modal */
.modal-content h2 {
  margin-top: 0;
  text-align: center;
}

/* Form styling inside the modal */
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

/* Success & Error messages */
.success-message {
  color: green;
  margin-top: 10px;
  text-align: center;
}
.error-message {
  color: red;
  margin-top: 10px;
  text-align: center;
}

/* Button row inside modal */
.button-row {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

/* Cancel & Save buttons in modal */
.cancel-button,
.save-button {
  flex: 0 0 48%;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}
.cancel-button {
  background-color: #555;
  color: white;
}
.cancel-button:hover {
  background-color: #333;
}
.save-button {
  background-color: red;
  color: white;
}
.save-button:hover {
  background-color: darkred;
}
</style>
