
import { ref, computed } from "vue";
import { defineStore } from "pinia";

import echo from "@/services/echo";
import { useAuthStore } from "@/stores/auth";

export const useNotificationStore = defineStore(
    "notification",
    () => {
        const auth = useAuthStore();

        const notifications = ref([]);
        const notificationCount = ref(0);

        let orderChannel = null;
        let isSubscribed = false;

        /*
        |--------------------------------------------------------------------------
        | Unread Count
        |--------------------------------------------------------------------------
        */
        const unreadCount = computed(() => {
            return notificationCount.value;
        });

        /*
        |--------------------------------------------------------------------------
        | New Order Event
        |--------------------------------------------------------------------------
        */
        const handleNewOrder = (event) => {
            console.log(
                "🔥 REALTIME NEW ORDER:",
                event
            );

            const order = event?.order;

            if (!order) {
                console.warn(
                    "⚠️ order.created event has no order",
                    event
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Increase Notification Count
            |--------------------------------------------------------------------------
            */
            notificationCount.value += 1;

            /*
            |--------------------------------------------------------------------------
            | Add Notification
            |--------------------------------------------------------------------------
            */
            notifications.value.unshift({
                id: order.id,
                type: "new_order",
                title: "New Order Received",
                message: order.order_number,
                order: order,
                read: false,
                created_at: new Date(),
            });

            console.log(
                "🔴 Notification Count:",
                notificationCount.value
            );
        };

        /*
        |--------------------------------------------------------------------------
        | Subscribe
        |--------------------------------------------------------------------------
        */
        const subscribe = async () => {
            /*
            |--------------------------------------------------------------------------
            | Already subscribed
            |--------------------------------------------------------------------------
            */
            if (isSubscribed) {
                console.log(
                    "ℹ️ Already subscribed to restaurant.orders"
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Authentication
            |--------------------------------------------------------------------------
            */
            if (!auth.token) {
                console.warn(
                    "⚠️ No authentication token."
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Load Current User
            |--------------------------------------------------------------------------
            */
            if (!auth.user) {
                try {
                    console.log(
                        "👤 Loading current user..."
                    );

                    await auth.me();
                } catch (error) {
                    console.error(
                        "❌ Failed to load current user:",
                        error
                    );

                    return;
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Role Check
            |--------------------------------------------------------------------------
            */
            const role = auth.user.user?.role ? auth.user.user?.role : auth.user?.role;

            console.log(
                "👤 Authenticated user:",
                auth.user
            );

            console.log(
                "👤 User role:",
                role
            );

            if (
                role !== "admin" &&
                role !== "staff"
            ) {
                console.warn(
                    "⚠️ User is not admin/staff:",
                    role
                );

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | Leave Existing Channel
            |--------------------------------------------------------------------------
            */
            try {
                echo.leave(
                    "private-restaurant.orders"
                );
            } catch {
                //
            }

            /*
            |--------------------------------------------------------------------------
            | Subscribe
            |--------------------------------------------------------------------------
            */
            console.log(
                "📡 Subscribing to restaurant.orders..."
            );

            orderChannel =
                echo.private(
                    "restaurant.orders"
                );

            /*
            |--------------------------------------------------------------------------
            | Listen New Order
            |--------------------------------------------------------------------------
            */
            orderChannel.listen(
                ".order.created",
                handleNewOrder
            );

            /*
            |--------------------------------------------------------------------------
            | Channel Error
            |--------------------------------------------------------------------------
            */
            orderChannel.error((error) => {
                console.error(
                    "❌ restaurant.orders channel error:",
                    error
                );

                isSubscribed = false;
            });

            isSubscribed = true;

            console.log(
                "✅ restaurant.orders listener ready"
            );
        };

        /*
        |--------------------------------------------------------------------------
        | Clear / Mark as Read
        |--------------------------------------------------------------------------
        */
        const clearNotifications = () => {
            notifications.value.forEach(
                (notification) => {
                    notification.read = true;
                }
            );

            notificationCount.value = 0;
        };

        /*
        |--------------------------------------------------------------------------
        | Reset
        |--------------------------------------------------------------------------
        */
        const reset = () => {
            try {
                echo.leave(
                    "private-restaurant.orders"
                );
            } catch {
                //
            }

            notifications.value = [];
            notificationCount.value = 0;

            orderChannel = null;
            isSubscribed = false;
        };

        return {
            notifications,
            notificationCount,
            unreadCount,

            subscribe,
            clearNotifications,
            reset,
        };
    }
);
