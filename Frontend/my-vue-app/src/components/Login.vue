<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const password = ref('')

// Basic login handler
const login = () => {
    // Replace with your actual authentication logic
    if (username.value && password.value) {
        console.log('Logging in user:', username.value)
        // On success, redirect to home or another route
        router.push('/')
    } else {
        console.error('Username or password missing')
    }
}

// Navigate to register page
const goToRegister = () => {
    router.push('/register')
}
</script>

<template>
    <div class="login-page">
        <div class="form-container">
            <h2>Login</h2>
            <form @submit.prevent="login">
                <label for="username">Username</label>
                <input id="username" type="text" v-model="username" required />

                <label for="password">Password</label>
                <input id="password" type="password" v-model="password" required />

                <button type="submit" class="login-button">Login</button>
            </form>

            <!-- Register button -->
            <button class="register-button" @click="goToRegister">Register</button>
        </div>
    </div>
</template>

<style scoped>
/* Center the login card vertically and horizontally */
.login-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
    background-color: #f5f5f5;
}

/* Card-like container */
.form-container {
    background-color: #fff;
    padding: 2rem 3rem;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    max-width: 320px;
    width: 100%;
    text-align: center;
}

/* Title spacing */
h2 {
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
}

/* Form elements */
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

/* Login button */
.login-button {
    width: 80%;
    max-width: 200px;
    padding: 0.75rem;
    margin: 0.5rem auto 0;
    font-weight: bold;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    background-color: red;
    color: white;
    font-size: 1rem;
    display: block;
}

.login-button:hover {
    background-color: darkred;
}

/* Register button */
.register-button {
    width: 80%;
    max-width: 200px;
    padding: 0.75rem;
    margin: 1rem auto 0;
    font-weight: bold;
    border: 2px solid red;
    border-radius: 5px;
    cursor: pointer;
    background-color: #fff;
    color: red;
    font-size: 1rem;
    display: block;
}

.register-button:hover {
    background-color: #f8f8f8;
}
</style>
