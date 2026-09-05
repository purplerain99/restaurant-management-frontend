<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const auth = useAuthStore();

const email = ref("");
const password = ref("");

const loading = ref(false);
const errorMessage = ref("");

const submit = async () => {
    loading.value = true;
    errorMessage.value = "";

    try {
        await auth.login(
            email.value,
            password.value
        );

        if (auth.isAdmin) {
            await router.replace({
                name: "admin.dashboard",
            });
        } else {
            await router.replace({
                name: "admin.orders",
            });
        }
    } catch (error) {
        console.error(
            "LOGIN ERROR:",
            error
        );

        errorMessage.value =
            error.response?.data?.message ||
            "Login မအောင်မြင်ပါ။";
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div
        class="flex min-h-screen items-center justify-center bg-slate-100 px-4"
    >
        <div
            class="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"
        >
            <div class="text-center">
                <div
                    class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-xl font-black text-white"
                >
                    R
                </div>

                <h1
                    class="mt-5 text-2xl font-black text-slate-900"
                >
                    Restaurant Admin
                </h1>

                <p
                    class="mt-2 text-sm text-slate-500"
                >
                    Sign in to continue
                </p>
            </div>

            <div
                v-if="errorMessage"
                class="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
                {{ errorMessage }}
            </div>

            <form
                class="mt-6 space-y-4"
                @submit.prevent="submit"
            >
                <div>
                    <label
                        class="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Email
                    </label>

                    <input
                        v-model="email"
                        type="email"
                        required
                        autocomplete="email"
                        class="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900"
                        placeholder="admin@example.com"
                    />
                </div>

                <div>
                    <label
                        class="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Password
                    </label>

                    <input
                        v-model="password"
                        type="password"
                        required
                        autocomplete="current-password"
                        class="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    :disabled="loading"
                    class="w-full rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {{
                        loading
                            ? "Login ဝင်နေသည်..."
                            : "Login"
                    }}
                </button>
            </form>
        </div>
    </div>
</template>