import { computed, ref } from "vue";
import { defineStore } from "pinia";

import api from "@/services/api";

export const useAuthStore = defineStore("auth", () => {
    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */
    const user = ref(null);

    const token = ref(
        localStorage.getItem("token") || null
    );

    /*
    |--------------------------------------------------------------------------
    | Getters
    |--------------------------------------------------------------------------
    */
    const isAuthenticated = computed(() => {
        return Boolean(token.value);
    });

    const isAdmin = computed(() => {
        console.log(user.value.user?.role, "this is user role");

        return user.value.user?.role === "admin";
    });

    const isStaff = computed(() => {
        return user.value.user?.role === "staff";
    });

    /*
    |--------------------------------------------------------------------------
    | Login
    |--------------------------------------------------------------------------
    */
    const login = async (email, password) => {
        const response = await api.post(
            "/auth/login",
            {
                email,
                password,
            }
        );

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        |--------------------------------------------------------------------------
        | Expected response:
        |
        | {
        |   success: true,
        |   data: {
        |      token: "...",
        |      user: {...}
        |   }
        | }
        |--------------------------------------------------------------------------
        */
        const data = response.data?.data;

        if (!data?.token) {
            throw new Error(
                "Login token မရရှိပါ။"
            );
        }

        token.value = data.token;

        localStorage.setItem(
            "token",
            data.token
        );

        user.value = data.user ?? null;

        return response;
    };

    /*
    |--------------------------------------------------------------------------
    | Current User
    |--------------------------------------------------------------------------
    */
    const me = async () => {
        if (!token.value) {
            user.value = null;
            return null;
        }

        const response = await api.get(
            "/auth/me"
        );

        user.value =
            response.data?.data ?? null;

        return user.value;
    };

    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */
    const logout = async () => {
        try {
            if (token.value) {
                await api.post(
                    "/auth/logout"
                );
            }
        } catch (error) {
            console.error(
                "Logout error:",
                error
            );
        } finally {
            token.value = null;
            user.value = null;

            localStorage.removeItem("token");
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Return Store
    |--------------------------------------------------------------------------
    */
    return {
        user,
        token,

        isAuthenticated,
        isAdmin,
        isStaff,

        login,
        me,
        logout,
    };
});

