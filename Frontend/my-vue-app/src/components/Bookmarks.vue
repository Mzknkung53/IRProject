<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const folders = ref<any[]>([]);
const errorMessage = ref('');

// Go to Home Page
const goHome = () => {
  router.push('/page/1');
};

// Fetch bookmarks
const fetchBookmarks = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://127.0.0.1:5000/bookmarks', {
      headers: { Authorization: `Bearer ${token}` },
    });
    folders.value = response.data.folders || [];
  } catch (err: any) {
    errorMessage.value = err.response?.data?.error || 'Failed to fetch bookmarks.';
  }
};

// Delete bookmark
const deleteBookmark = async (folderId: number, recipeId: number) => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete('http://127.0.0.1:5000/bookmark', {
      headers: { Authorization: `Bearer ${token}` },
      data: { folder_id: folderId, recipe_id: recipeId },
    });
    fetchBookmarks();
  } catch (err: any) {
    errorMessage.value = err.response?.data?.error || 'Failed to delete bookmark.';
  }
};

// Delete folder
const deleteFolder = async (folderId: number) => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete('http://127.0.0.1:5000/folder', {
      headers: { Authorization: `Bearer ${token}` },
      data: { folder_id: folderId },
    });
    fetchBookmarks();
  } catch (err: any) {
    errorMessage.value = err.response?.data?.error || 'Failed to delete folder.';
  }
};

// Image helper
const getRecipeImage = (image: string | string[]) => {
  if (!image) return "https://via.placeholder.com/100";
  if (Array.isArray(image)) {
    return image.length > 0 ? image[0] : "https://via.placeholder.com/100";
  }
  return image;
};

onMounted(() => {
  fetchBookmarks();
});
</script>

<template>
  <div class="bookmarks-page">
    <!-- HOME Button -->
    <button class="home-button" @click="goHome">🏠 Home</button>

    <h1>Your Bookmarks</h1>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <div v-else>
      <div v-if="folders.length === 0" class="no-bookmarks">
        No bookmarks found.
      </div>

      <div v-else class="folders-container">
        <div v-for="folder in folders" :key="folder.folder_id" class="folder-box">
          <!-- Folder Header -->
          <div class="folder-header">
            <h2 class="folder-title">{{ folder.folder_name }}</h2>
            <div class="folder-actions">
              <!-- Suggest List -->
              <router-link :to="`/suggestions/${folder.folder_id}`" class="suggest-button">
                💡 Suggest List
              </router-link>

              <!-- Delete Folder -->
              <button class="delete-folder" @click="deleteFolder(folder.folder_id)">
                🗑 Delete Folder
              </button>
            </div>
          </div>

          <!-- Recipes -->
          <ul class="recipe-list">
            <li v-for="recipe in folder.recipes" :key="recipe.recipe_id" class="recipe-item">
              <img :src="getRecipeImage(recipe.image_url)" :alt="recipe.name" class="recipe-image" />

              <div class="recipe-info">
                <router-link :to="`/recipe/${recipe.recipe_id}`" class="recipe-link">
                  Recipe ID: {{ recipe.recipe_id }}, Rating: ⭐ {{ recipe.rating }}
                </router-link>
              </div>

              <button class="delete-button" @click="deleteBookmark(folder.folder_id, recipe.recipe_id)">
                ❌ Remove
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bookmarks-page {
  max-width: 800px;
  margin: auto;
  text-align: center;
  padding: 20px;
}

.home-button {
  background-color: #007bff;
  color: white;
  border-radius: 5px;
  font-weight: bold;
  padding: 10px 15px;
  margin-bottom: 15px;
  cursor: pointer;
  border: none;
}

.home-button:hover {
  background-color: #0056b3;
}

.error-message {
  color: red;
  font-weight: bold;
}

.folders-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.folder-box {
  background: #f8f8f8;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  text-align: left;
  position: relative;
}

.folder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.suggest-button {
  background-color: #28a745;
  color: white;
  padding: 8px 12px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  margin-right: 10px;
  font-size: 14px;
}

.suggest-button:hover {
  background-color: #218838;
}

.folder-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.delete-folder {
  background: red;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
}

.delete-folder:hover {
  background: darkred;
}

.recipe-list {
  list-style: none;
  padding: 0;
  margin-top: 10px;
}

.recipe-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 8px;
  margin-top: 10px;
  transition: background 0.3s;
}

.recipe-item:hover {
  background: #ececec;
}

.recipe-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 5px;
  margin-right: 10px;
}

.recipe-info {
  flex-grow: 1;
}

.recipe-link {
  text-decoration: none;
  color: #007bff;
  font-weight: bold;
}

.recipe-link:hover {
  text-decoration: underline;
}

.delete-button {
  background: none;
  border: 2px solid red;
  color: red;
  font-size: 14px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.delete-button:hover {
  background: red;
  color: white;
}
</style>
