import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        redirect: '/login',
    },

    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/auth/LoginView.vue'),
    },

    {
        path: '/admin',
        name: 'admin.dashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router