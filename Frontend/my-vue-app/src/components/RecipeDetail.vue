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

const props = defineProps<{ id: string | null }>();
const emit = defineEmits(['close']);

// ✅ Toast Notification State
const showToast = ref(false);
const toastMessage = ref('');

// Fetch recipe details
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
  if (props.id) fetchRecipeDetails(props.id);
});
watch(() => props.id, (newId) => {
  if (newId) fetchRecipeDetails(newId);
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

// ✅ Add Bookmark and Show Toast
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
    showBookmarkModal.value = false;  // ✅ Close modal

    // ✅ Show toast
    toastMessage.value = successMessage.value;
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
      toastMessage.value = '';
    }, 3000);
  } catch (err: any) {
    errorMessage.value = err.response?.data?.error || 'Error adding bookmark.';
    console.error('Bookmark error:', err);
  }
};

// Close modal if overlay clicked
const closeModalIfOverlayClicked = (event: MouseEvent) => {
  if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
    emit('close');
  }
};
</script>

<template>
  <div class="modal-overlay" @click="closeModalIfOverlayClicked">
    <div class="modal-card" @click.stop>
      <button class="close-button" @click="emit('close')">✖</button>

      <div v-if="recipe" class="recipe-content">
        <div class="section-image">
          <img :src="recipe.image_url" alt="Recipe Image" class="recipe-image" />
        </div>

        <h1 class="recipe-title">{{ recipe.name }}</h1>
        <div class="info-row">
          <p><strong>Rating:</strong> ⭐ {{ recipe.rating > 0 ? recipe.rating.toFixed(1) : "N/A" }}</p>
          <p><strong>Calories:</strong> {{ recipe.calories }}</p>
        </div>

        <p class="description">{{ recipe.description }}</p>

        <h2>Instructions</h2>
        <ul v-if="recipe.instructions && recipe.instructions.length > 0" class="instructions-list">
          <li v-for="(step, index) in recipe.instructions.split('. ') || []" :key="index">
            {{ step }}
          </li>
        </ul>
        <p v-else>No instructions available.</p>

        <button class="bookmark-button" @click="toggleBookmarkModal">Bookmark This Recipe</button>
      </div>

      <div v-else class="loading-message">
        <p>Loading recipe details...</p>
      </div>
    </div>

    <!-- ✅ Bookmark Modal -->
    <div v-if="showBookmarkModal" class="bookmark-modal-overlay" @click="closeModalIfOverlayClicked">
      <div class="bookmark-modal-content" @click.stop>
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

    <!-- ✅ Toast Notification -->
    <div v-if="showToast" class="toast">
      {{ toastMessage }}
    </div>
  </div>
</template>


<style scoped>
/* Overlay */
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
  overflow-y: auto;
  padding: 20px;
}

.modal-card {
  background: white;
  border-radius: 10px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 25px;
  padding-top: 40px;
  position: relative;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.close-button {
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  z-index: 1001;
}

.section-image {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.recipe-image {
  width: 250px;
  height: 200px;
  border-radius: 10px;
  object-fit: cover;
  margin: 20px auto;
  display: block;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.recipe-title {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 10px;
  text-align: center;
}

.info-row {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 10px;
  font-size: 1rem;
  color: #555;
}

.description {
  text-align: center;
  color: #666;
  margin-bottom: 15px;
}

.instructions-list {
  padding-left: 20px;
  color: #444;
  line-height: 1.6;
  margin-bottom: 20px;
}

.bookmark-button {
  background-color: #f44336;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  display: block;
  margin: 0 auto;
}

.bookmark-button:hover {
  background-color: #c62828;
}

.bookmark-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}

.bookmark-modal-content {
  background: white;
  padding: 25px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  text-align: left;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
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

.loading-message {
  text-align: center;
  padding: 30px;
  font-size: 1.1rem;
}

/* ✅ Toast Style */
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #4CAF50;
  color: white;
  padding: 12px 20px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  font-weight: bold;
  z-index: 9999;
  animation: fadein 0.5s, fadeout 0.5s 2.5s;
}

@keyframes fadein {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeout {
  from {
    opacity: 1;
    transform: translateY(0);
  }

  to {
    opacity: 0;
    transform: translateY(10px);
  }
}
</style>
