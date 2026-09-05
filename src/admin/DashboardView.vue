<script setup>
import { onMounted, ref } from "vue";

import { getDashboard } from "@/services/dashboard";

const loading = ref(true);
const errorMessage = ref("");

const dashboard = ref({
  today: {
    orders_count: 0,
    sales: 0,
    pending_orders: 0,
  },
});

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString();
};

const loadDashboard = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await getDashboard();

    dashboard.value = response.data?.data ?? {
      today: {
        orders_count: 0,
        sales: 0,
        pending_orders: 0,
      },
    };
  } catch (error) {
    console.error("DASHBOARD ERROR:", error);

    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      "Dashboard data ရယူ၍မရပါ။";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadDashboard();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-black text-slate-900">Dashboard</h1>

      <p class="mt-1 text-sm text-slate-500">Today's restaurant overview</p>
    </div>

    <!-- Error -->
    <div
      v-if="errorMessage"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700"
    >
      {{ errorMessage }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="item in 3"
        :key="item"
        class="h-32 animate-pulse rounded-3xl bg-white shadow-sm"
      ></div>
    </div>

    <!-- KPI -->
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <!-- =====================================================
                 TODAY ORDERS
            ====================================================== -->
      <section
        class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500">Today's Orders</p>

            <p class="mt-2 text-3xl font-black text-slate-900">
              {{ formatNumber(dashboard.today.orders_count) }}
            </p>

            <p class="mt-1 text-xs text-slate-400">Orders created today</p>
          </div>

          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"
          >
            <!-- Shopping Bag -->
            <svg
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
        </div>
      </section>

      <!-- =====================================================
                 TODAY SALES
            ====================================================== -->
      <section
        class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500">Today's Sales</p>

            <p class="mt-2 text-3xl font-black text-slate-900">
              {{ formatNumber(dashboard.today.sales) }}
              <span class="text-base font-bold text-slate-500"> MMK </span>
            </p>

            <p class="mt-1 text-xs text-slate-400">
              Excluding cancelled orders
            </p>
          </div>

          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"
          >
            <!-- Currency -->
            <svg
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-10v2m0 8v2m9-6a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </section>

      <!-- =====================================================
                 PENDING ORDERS
            ====================================================== -->
      <section
        class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500">Pending Orders</p>

            <p class="mt-2 text-3xl font-black text-slate-900">
              {{ formatNumber(dashboard.today.pending_orders) }}
            </p>

            <p class="mt-1 text-xs text-slate-400">Waiting for confirmation</p>
          </div>

          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"
          >
            <!-- Clock -->
            <svg
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
