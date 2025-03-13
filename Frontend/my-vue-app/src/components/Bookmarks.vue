<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const folders = ref<any[]>([]);
const errorMessage = ref('');

const fetchBookmarks = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:5000/bookmarks');
    folders.value = response.data.folders || [];
  } catch (err: any) {
    errorMessage.value = err.response?.data?.error || 'Failed to fetch bookmarks.';
  }
};

onMounted(() => {
  fetchBookmarks();
});
</script>

<template>
  <div class="bookmarks-page">
    <h1>Your Bookmarks</h1>
    <p v-if="errorMessage" style="color:red;">{{ errorMessage }}</p>
    <div v-else>
      <div v-if="folders.length === 0">No bookmarks found.</div>
      <div v-else>
        <div
          v-for="folder in folders"
          :key="folder.folder_id"
          class="folder-section"
        >
          <h2>{{ folder.folder_name }}</h2>
          <ul>
            <li
              v-for="recipe in folder.recipes"
              :key="recipe.recipe_id"
            >
              Recipe ID: {{ recipe.recipe_id }},
              Rating: {{ recipe.rating }}
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
  text-align: left;
  padding: 20px;
}
.folder-section {
  margin-bottom: 20px;
}
</style>
