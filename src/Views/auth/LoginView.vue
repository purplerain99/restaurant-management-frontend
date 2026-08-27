<script setup>
import { ref } from 'vue'
import api from '@/services/api'

const email = ref('')
const password = ref('')

const loading = ref(false)
const errorMessage = ref('')

const login = async () => {
    loading.value = true
    errorMessage.value = ''

    try {
        const response = await api.post('/auth/login', {
            email: email.value,
            password: password.value,
        })

        console.log(response.data)
    } catch (error) {
        errorMessage.value =
            error.response?.data?.message ||
            'Login ပြုလုပ်၍မရပါ။'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="login-page">
        <h1>Restaurant Management System</h1>

        <form @submit.prevent="login">
            <div>
                <label>အီးမေးလ်</label>

                <input v-model="email" type="email" placeholder="admin@gmail.com" />
            </div>

            <div>
                <label>စကားဝှက်</label>

                <input v-model="password" type="password" placeholder="Password" />
            </div>

            <p v-if="errorMessage">
                {{ errorMessage }}
            </p>

            <button type="submit" :disabled="loading">
                {{ loading ? 'ဝင်နေသည်...' : 'Login ဝင်မည်' }}
            </button>
        </form>
    </div>
</template>