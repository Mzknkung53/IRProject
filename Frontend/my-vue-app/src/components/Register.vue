<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')

const register = () => {
    // Simple client-side checks
    if (!username.value || !password.value || !confirmPassword.value) {
        console.error('All fields are required')
        return
    }
    if (password.value !== confirmPassword.value) {
        console.error('Passwords do not match')
        return
    }

    // Replace with your own registration logic
    console.log('Registering user:', username.value)

    // On success, go to login or home
    router.push('/login')
}
</script>
<template>
    <div class="register-page">
        <div class="form-container">
            <h2>Register</h2>
            <form @submit.prevent="register">
                <label for="username">Username</label>
                <input id="username" type="text" v-model="username" required />

                <label for="password">Password</label>
                <input id="password" type="password" v-model="password" required />

                <label for="confirmPassword">Confirm Password</label>
                <input id="confirmPassword" type="password" v-model="confirmPassword" required />

                <button type="submit" class="register-button">Register</button>
            </form>
        </div>
    </div>
</template>

<style scoped>
.register-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
    /* Adjust as needed */
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

/* Register button */
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