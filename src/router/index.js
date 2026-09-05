import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
    history: createWebHistory(),

    routes: [

        /*
        |--------------------------------------------------------------------------
        | Root
        |--------------------------------------------------------------------------
        */
        {
            path: "/",
            redirect: {
                name: "login",
            },
        },

        /*
        |--------------------------------------------------------------------------
        | Login
        |--------------------------------------------------------------------------
        */
        {
            path: "/login",
            name: "login",
            component: () =>
                import("@/views/auth/LoginView.vue"),
            meta: {
                guestOnly: true,
            },
        },

        /*
        |--------------------------------------------------------------------------
        | Customer
        |--------------------------------------------------------------------------
        */
        {
            path: "/t/:table_code",
            component: () =>
                import("@/layouts/CustomerLayout.vue"),

            children: [
                {
                    path: "",
                    name: "customer.menu",
                    component: () =>
                        import("@/views/customer/MenuView.vue"),
                },

                {
                    path: "cart",
                    name: "customer.cart",
                    component: () =>
                        import("@/views/customer/CartView.vue"),
                },

                {
                    path: "order-success/:order_number/:tracking_token",
                    name: "customer.order-success",
                    component: () =>
                        import(
                            "@/views/customer/OrderSuccessView.vue"
                        ),
                },

                {
                    path: "order-tracking/:tracking_token",
                    name: "customer.order-tracking",
                    component: () =>
                        import(
                            "@/views/customer/OrderTrackingView.vue"
                        ),
                },
            ],
        },

        /*
        |--------------------------------------------------------------------------
        | Admin
        |--------------------------------------------------------------------------
        */
        {
            path: "/admin",
            component: () =>
                import("@/layouts/AdminLayout.vue"),

            meta: {
                requiresAuth: true,
            },

            children: [
                {
                    path: "",
                    name: "admin.dashboard",
                    component: () =>
                        import(
                            "@/admin/DashboardView.vue"
                        ),
                },

                {
                    path: "orders",
                    name: "admin.orders",
                    component: () =>
                        import(
                            "@/views/admin/OrdersView.vue"
                        ),
                },

                {
                    path: "kitchen",
                    name: "admin.kitchen",
                    component: () =>
                        import(
                            "@/views/admin/KitchenView.vue"
                        ),
                },

                {
                    path: "categories",
                    name: "admin.categories",
                    component: () =>
                        import(
                            "@/views/admin/CategoriesView.vue"
                        ),
                    meta: {
                        adminOnly: true,
                    },
                },

                {
                    path: "menu",
                    name: "admin.menu",
                    component: () =>
                        import(
                            "@/views/admin/MenuItemsView.vue"
                        ),
                    meta: {
                        adminOnly: true,
                    },
                },

                {
                    path: "tables",
                    name: "admin.tables",
                    component: () =>
                        import(
                            "@/admin/TablesView.vue"
                        ),
                    meta: {
                        adminOnly: true,
                    },
                },
            ],
        },
    ],
});

router.beforeEach(async (to) => {
    const auth = useAuthStore();

    /*
    |--------------------------------------------------------------------------
    | Guest-only pages
    |--------------------------------------------------------------------------
    */
    if (
        to.meta.guestOnly &&
        auth.isAuthenticated
    ) {
        return {
            name: auth.user?.role === "admin"
                ? "admin.dashboard"
                : "admin.orders",
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Protected pages
    |--------------------------------------------------------------------------
    */
    if (to.meta.requiresAuth) {
        if (!auth.isAuthenticated) {
            return {
                name: "login",
                query: {
                    redirect: to.fullPath,
                },
            };
        }

        if (!auth.user) {
            try {
                await auth.me();
            } catch {
                await auth.logout();

                return {
                    name: "login",
                };
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Admin only
        |--------------------------------------------------------------------------
        */
        if (
            to.meta.adminOnly &&
            auth.user.user?.role !== "admin"
        ) {
            return {
                name: "admin.orders",
            };
        }
    }

    return true;
});

export default router;