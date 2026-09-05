<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import { getPublicOrder } from "@/services/order";

const route = useRoute();
const router = useRouter();

const order = ref(null);
const loading = ref(true);
const errorMessage = ref("");

const formatPrice = (value) => {
  return Number(value || 0).toLocaleString();
};

const loadOrder = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await getPublicOrder(route.params.order_number);

    order.value = response.data?.data ?? null;

    if (!order.value) {
      throw new Error("Order information မတွေ့ပါ။");
    }
  } catch (error) {
    console.error("ORDER SLIP ERROR:", error);

    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      "Order information ရယူ၍မရပါ။";
  } finally {
    loading.value = false;
  }
};

const backToMenu = () => {
  router.push({
    name: "customer.menu",
    params: {
      table_code: route.params.table_code,
    },
  });
};

const statusLabel = computed(() => {
  const status = order.value?.status;

  const labels = {
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    ready: "Preparing",
    served: "Served",
    completed: "Served",
    cancelled: "Cancelled",
  };

  return labels[status] || status;
});

onMounted(() => {
  loadOrder();
});
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <div v-if="loading" class="py-20 text-center">Loading...</div>

    <div
      v-else-if="errorMessage"
      class="rounded-3xl bg-white p-8 text-center shadow-sm"
    >
      <div class="text-5xl">⚠️</div>

      <h2 class="mt-4 text-lg font-bold">Order မတွေ့ပါ။</h2>

      <p class="mt-2 text-sm text-slate-500">
        {{ errorMessage }}
      </p>

      <button
        type="button"
        @click="backToMenu"
        class="mt-6 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"
      >
        Menu သို့ပြန်သွားမည်
      </button>
    </div>

    <div
      v-else-if="order"
      class="overflow-hidden rounded-3xl bg-white shadow-sm"
    >
      <!-- Header -->
      <div class="border-b border-slate-200 px-6 py-6 text-center">
        <h1 class="text-2xl font-black text-slate-900">Restaurant</h1>

        <p class="mt-1 text-sm text-slate-500">Order Slip</p>

        <p class="mt-4 text-2xl font-black text-slate-900">
          {{ order.order_number }}
        </p>

        <div
          class="mt-3 flex flex-wrap justify-center gap-2 text-sm text-slate-500"
        >
          <span>
            {{ order.table?.name }}
          </span>

          <span>•</span>

          <span>
            {{ new Date(order.created_at).toLocaleString() }}
          </span>
        </div>

        <div class="mt-4">
          <span
            class="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700"
          >
            {{ statusLabel }}
          </span>
        </div>
      </div>

      <!-- Items -->
      <div class="border-b border-slate-200 p-6">
        <div
          v-for="item in order.items"
          :key="item.id"
          class="flex justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0"
        >
          <div class="min-w-0 flex-1">
            <p class="font-semibold text-slate-900">
              {{ item.menu_item_name }}
            </p>

            <p class="mt-1 text-sm text-slate-500">
              {{ formatPrice(item.unit_price) }}
              ×
              {{ item.quantity }}
            </p>
          </div>

          <p class="shrink-0 font-bold text-slate-900">
            {{ formatPrice(item.subtotal) }}
            MMK
          </p>
        </div>
      </div>

      <!-- Summary -->
      <div class="space-y-3 p-6">
        <div class="flex justify-between">
          <span class="text-slate-500"> Subtotal </span>

          <span class="font-semibold">
            {{ formatPrice(order.subtotal) }}
            MMK
          </span>
        </div>

        <div class="flex justify-between">
          <span class="text-slate-500"> Tax (5%) </span>

          <span class="font-semibold">
            {{ formatPrice(order.tax_amount) }}
            MMK
          </span>
        </div>

        <div class="flex justify-between">
          <span class="text-slate-500"> Service Charge (10%) </span>

          <span class="font-semibold">
            {{ formatPrice(order.service_charge) }}
            MMK
          </span>
        </div>

        <div class="flex justify-between border-t border-slate-200 pt-4">
          <span class="text-lg font-black"> Grand Total </span>

          <span class="text-2xl font-black">
            {{ formatPrice(order.grand_total) }}
            MMK
          </span>
        </div>
      </div>

      <!-- Action -->
      <div class="border-t border-slate-200 p-6">
        <button
          type="button"
          @click="backToMenu"
          class="w-full rounded-2xl bg-slate-900 px-5 py-4 text-sm font-black text-white"
        >
          Menu သို့ပြန်သွားပြီး Order ထပ်တင်မည်
        </button>
      </div>
    </div>
  </div>
</template>