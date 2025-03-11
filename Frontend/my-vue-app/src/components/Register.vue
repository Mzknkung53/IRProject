<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

const registerUser = async () => {
  if (!username.value || !password.value || !confirmPassword.value) {
    errorMessage.value = 'All fields are required'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match'
    return
  }
  
  try {
    const response = await axios.post('http://127.0.0.1:5000/register', {
      username: username.value,
      password: password.value
    })
    console.log('Registration successful:', response.data)
    // On success, redirect to login page
    router.push('/login')
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.error) {
      errorMessage.value = err.response.data.error
    } else {
      errorMessage.value = 'Registration failed'
    }
    console.error('Registration error:', err)
  }
}
</script>

<template>
  <div class="register-page">
    <div class="form-container">
      <h2>Register</h2>
      <form @submit.prevent="registerUser">
        <label for="username">Username</label>
        <input id="username" type="text" v-model="username" required />

        <label for="password">Password</label>
        <input id="password" type="password" v-model="password" required />

        <label for="confirmPassword">Confirm Password</label>
        <input id="confirmPassword" type="password" v-model="confirmPassword" required />

        <button type="submit" class="register-button">Register</button>
      </form>
      <!-- Display error message if present -->
      <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background-color: #f5f5f5;
}

.form-container {
  background-color: #fff;
  padding: 2rem 3rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  max-width: 320px;
  width: 100%;
  text-align: center;
}

h2 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

label {
  display: block;
  text-align: left;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.register-button {
  width: 100%;
  padding: 0.75rem;
  margin-top: 0.5rem;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: red;
  color: white;
  font-size: 1rem;
}

.register-button:hover {
  background-color: darkred;
}
</style>
