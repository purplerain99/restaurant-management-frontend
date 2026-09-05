<script setup>
import { onBeforeUnmount, onMounted } from "vue";

import { RouterLink, RouterView, useRouter } from "vue-router";

import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";

const router = useRouter();

const auth = useAuthStore();
const notification = useNotificationStore();

/*
|--------------------------------------------------------------------------
| Go To Orders
|--------------------------------------------------------------------------
*/
const goToOrders = () => {
  notification.clearNotifications();

  router.push({
    name: "admin.orders",
  });
};

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/
const handleLogout = async () => {
  notification.reset();

  await auth.logout();

  router.replace({
    name: "login",
  });
};

/*
|--------------------------------------------------------------------------
| Start Realtime
|--------------------------------------------------------------------------
*/
onMounted(async () => {
  console.log(notification.subscribe());
  console.log(auth.isAdmin);

  await notification.subscribe();
});

/*
|--------------------------------------------------------------------------
| Cleanup
|--------------------------------------------------------------------------
*/
onBeforeUnmount(() => {
  notification.reset();
});
</script>

<template>
  <div
    class="min-h-screen flex flex-col bg-slate-50 font-sans antialiased text-slate-800"
  >
    <!-- =========================================================
             HEADER
        ========================================================== -->
    <header
      class="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md"
    >
      <div class="flex h-16 items-center justify-between px-4 sm:px-6">
        <!-- Logo -->
        <RouterLink
          :to="{
            name: 'admin.dashboard',
          }"
          class="flex items-center gap-2.5 text-lg font-bold text-slate-900"
        >
          <div
            class="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-white"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332 0-4.5 1.253"
              />
            </svg>
          </div>

          <span>RestoAdmin</span>
        </RouterLink>

        <!-- Right -->
        <div class="flex items-center gap-3">
          <!-- Notification -->
          <button
            type="button"
            @click="goToOrders"
            class="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
            aria-label="Notifications"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>

            <!-- RED BADGE -->
            <span
              v-if="notification.notificationCount > 0"
              class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-black leading-none text-white shadow-md ring-2 ring-white"
            >
              {{
                notification.notificationCount > 99
                  ? "99+"
                  : notification.notificationCount
              }}
            </span>
          </button>

          <!-- User -->
          <div class="flex items-center gap-3 border-l border-slate-200 pl-3">
            <div class="hidden text-right sm:block">
              <p class="text-xs font-bold text-slate-800">
                {{ auth.user.user?.name || "User Account" }}
              </p>

              <span
                class="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600"
              >
                {{ auth.user.user?.role || "Staff" }}
              </span>
            </div>

            <div
              class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white"
            >
              {{
                auth.user?.name ? auth.user.name.charAt(0).toUpperCase() : "U"
              }}
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- =========================================================
             BODY
        ========================================================== -->
    <div class="flex flex-1">
      <!-- Sidebar -->
      <aside
        class="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col md:justify-between"
      >
        <div class="p-4">
          <p
            class="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400"
          >
            Main Menu
          </p>

          <nav class="mt-3 space-y-1">
            <!-- Dashboard -->
            <RouterLink
              :to="{
                name: 'admin.dashboard',
              }"
              class="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold hover:bg-slate-100"
              active-class="bg-slate-100 text-orange-600"
            >
              Dashboard
            </RouterLink>

            <!-- Orders -->
            <RouterLink
              :to="{
                name: 'admin.orders',
              }"
              class="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold hover:bg-slate-100"
              active-class="bg-slate-100 text-orange-600"
              @click="goToOrders"
            >
              <span>Orders</span>

              <span
                v-if="notification.notificationCount > 0"
                class="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black text-white"
              >
                {{
                  notification.notificationCount > 99
                    ? "99+"
                    : notification.notificationCount
                }}
              </span>
            </RouterLink>

            <!-- Kitchen -->
            <RouterLink
              :to="{
                name: 'admin.kitchen',
              }"
              class="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold hover:bg-slate-100"
              active-class="bg-slate-100 text-orange-600"
            >
              Kitchen
            </RouterLink>

            <!-- Admin Only -->
            <template v-if="auth.isAdmin">
              <div class="my-4 border-t border-slate-100"></div>

              <p
                class="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400"
              >
                Management
              </p>

              <RouterLink
                :to="{
                  name: 'admin.categories',
                }"
                class="mt-3 flex rounded-xl px-3.5 py-2.5 text-sm font-semibold hover:bg-slate-100"
                active-class="bg-slate-100 text-orange-600"
              >
                Categories
              </RouterLink>

              <RouterLink
                :to="{
                  name: 'admin.menu',
                }"
                class="flex rounded-xl px-3.5 py-2.5 text-sm font-semibold hover:bg-slate-100"
                active-class="bg-slate-100 text-orange-600"
              >
                Menu
              </RouterLink>

              <RouterLink
                :to="{
                  name: 'admin.tables',
                }"
                class="flex rounded-xl px-3.5 py-2.5 text-sm font-semibold hover:bg-slate-100"
                active-class="bg-slate-100 text-orange-600"
              >
                Tables
              </RouterLink>
            </template>
          </nav>
        </div>

        <!-- Logout -->
        <div class="border-t border-slate-100 p-4">
          <button
            type="button"
            @click="handleLogout"
            class="w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </aside>

      <!-- Main -->
      <main class="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
