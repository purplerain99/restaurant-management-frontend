<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { toPng } from "html-to-image";

import { getPublicOrder } from "../../services/order";

const route = useRoute();

const order = ref(null);
const loading = ref(true);
const errorMessage = ref("");

// Slip element ref
const receiptRef = ref(null);
const isDownloading = ref(false);

const orderNumber = computed(() => {
  return route.params.order_number;
});

const formatPrice = (value) => {
  return Number(value ?? 0).toLocaleString();
};

/*
|--------------------------------------------------------------------------
| Download Slip Function (using html-to-image)
|--------------------------------------------------------------------------
*/
const downloadSlip = async () => {
  if (!receiptRef.value || isDownloading.value) return;

  try {
    isDownloading.value = true;

    // html-to-image ကို သုံး၍ PNG Data URL သို့ ပြောင်းခြင်း
    const dataUrl = await toPng(receiptRef.value, {
      quality: 0.95,
      pixelRatio: 2, // High resolution image
      cacheBust: true,
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.download = `Order-Slip-${order.value?.order_number || "receipt"}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Slip download failed:", error);
    alert("Slip ဒေါင်းလုဒ်ဆွဲရာတွင် အမှားတစ်ခု ဖြစ်ပေါ်နေပါသည်။");
  } finally {
    isDownloading.value = false;
  }
};

onMounted(async () => {
  try {
    const response = await getPublicOrder(orderNumber.value);
    order.value = response.data;
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Order အချက်အလက် ရယူ၍မရပါ။";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="mx-auto max-w-xl space-y-6 p-4 sm:p-6 pb-24 relative">
    <!-- Skeleton Loading -->
    <div
      v-if="loading"
      class="rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-sm space-y-4"
    >
      <div
        class="mx-auto h-16 w-16 animate-pulse rounded-full bg-slate-100"
      ></div>
      <div class="mx-auto h-4 w-1/2 animate-pulse rounded bg-slate-100"></div>
      <div class="mx-auto h-6 w-1/3 animate-pulse rounded bg-slate-100"></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="errorMessage"
      class="rounded-3xl border border-rose-200 bg-rose-50/80 p-8 text-center shadow-sm backdrop-blur-sm"
    >
      <div
        class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-3xl"
      >
        ⚠️
      </div>
      <h2 class="mt-4 text-base font-bold text-rose-900">
        အမှားတစ်ခု ဖြစ်ပေါ်နေပါသည်။
      </h2>
      <p class="mt-1 text-xs text-rose-700">
        {{ errorMessage }}
      </p>
    </div>

    <template v-else-if="order">
      <!-- Printable Slip Area (Captured via html-to-image) -->
      <div
        ref="receiptRef"
        class="space-y-6 bg-slate-50 p-3 sm:p-4 rounded-3xl"
      >
        <!-- Success Banner Card -->
        <section
          class="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 text-center shadow-sm"
        >
          <div class="relative z-10">
            <div
              class="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 shadow-inner"
            >
              <svg
                class="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>

            <p
              class="mt-4 text-xs font-bold tracking-wide uppercase text-emerald-600"
            >
              Order Placed Successfully
            </p>

            <h1
              class="mt-1 font-mono text-2xl sm:text-3xl font-black text-slate-900 tracking-tight"
            >
              #{{ order.order_number }}
            </h1>

            <!-- Status Badge -->
            <div class="mt-3">
              <span
                class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-3.5 py-1 text-xs font-semibold text-amber-700"
              >
                <span
                  class="h-2 w-2 rounded-full bg-amber-500 animate-pulse"
                ></span>
                {{ order.status }}
              </span>
            </div>

            <!-- Guest & Table Info Grid -->
            <div
              class="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-100 grid grid-cols-2 gap-3 text-left"
            >
              <div>
                <span
                  class="block text-[11px] font-semibold text-slate-400 uppercase"
                >
                  Table
                </span>
                <span class="text-sm font-bold text-slate-800">
                  {{ order.table?.name || "N/A" }}
                </span>
              </div>

              <div v-if="order.guest_name">
                <span
                  class="block text-[11px] font-semibold text-slate-400 uppercase"
                >
                  Name
                </span>
                <span class="text-sm font-bold text-slate-800 line-clamp-1">
                  {{ order.guest_name }}
                </span>
              </div>

              <div
                v-if="order.guest_phone"
                class="col-span-2 border-t border-slate-200/60 pt-2"
              >
                <span
                  class="block text-[11px] font-semibold text-slate-400 uppercase"
                >
                  Phone
                </span>
                <span class="text-sm font-bold text-slate-800">
                  {{ order.guest_phone }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- Order Items Section -->
        <section
          class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4"
        >
          <h2 class="text-sm font-bold tracking-wider text-slate-400 uppercase">
            Order Items Details
          </h2>

          <div class="divide-y divide-slate-100">
            <!-- Item Row -->
            <div
              v-for="item in order.items"
              :key="item.id"
              class="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3"
            >
              <div class="flex items-start gap-3 min-w-0">
                <span
                  class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600 mt-0.5"
                >
                  {{ item.quantity ?? 1 }}x
                </span>

                <div class="min-w-0">
                  <p class="text-sm font-bold text-slate-800 line-clamp-1">
                    {{ item.menu_item_name }}
                  </p>
                  <p
                    v-if="item.special_note"
                    class="text-xs text-amber-600 mt-0.5"
                  >
                    Note: {{ item.special_note }}
                  </p>
                </div>
              </div>

              <span class="text-sm font-extrabold text-slate-900 shrink-0">
                {{ formatPrice(item.subtotal) }}
                <span class="text-[10px] font-bold text-indigo-600">MMK</span>
              </span>
            </div>
          </div>

          <!-- Charges & Taxes Breakdown -->
          <div
            v-if="order.service_charge || order.tax_amount"
            class="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-500"
          >
            <div
              v-if="order.service_charge"
              class="flex justify-between items-center"
            >
              <span>
                Service Charge
                <span
                  v-if="order.service_charge_rate"
                  class="text-[10px] text-slate-400"
                >
                  ({{ order.service_charge_rate }}%)
                </span>
              </span>
              <span class="font-semibold text-slate-700">
                {{ formatPrice(order.service_charge) }} MMK
              </span>
            </div>

            <div
              v-if="order.tax_amount"
              class="flex justify-between items-center"
            >
              <span>
                Tax
                <span v-if="order.tax_rate" class="text-[10px] text-slate-400">
                  ({{ order.tax_rate }}%)
                </span>
              </span>
              <span class="font-semibold text-slate-700">
                {{ formatPrice(order.tax_amount) }} MMK
              </span>
            </div>
          </div>

          <!-- Grand Total -->
          <div
            class="border-t border-slate-200/80 pt-4 flex justify-between items-baseline"
          >
            <span class="text-sm font-bold text-slate-900">Total Amount</span>
            <div>
              <span class="text-xl font-black text-indigo-600">
                {{ formatPrice(order.grand_total) }}
              </span>
              <span class="ml-1 text-xs font-bold text-indigo-600">MMK</span>
            </div>
          </div>
        </section>
      </div>

      <!-- Tracking Action Button -->
      <RouterLink
        :to="{
          name: 'customer.order-tracking',
          params: {
            tracking_token: order.tracking_token,
          },
        }"
        class="group flex w-full items-center justify-between rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-all duration-200 hover:bg-indigo-500 active:scale-95"
      >
        <span>Order Status စောင့်ကြည့်မည်</span>
        <svg
          class="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
          />
        </svg>
      </RouterLink>

      <!-- Floating Download Slip Button -->
      <div class="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          @click="downloadSlip"
          :disabled="isDownloading"
          class="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3.5 text-xs font-bold text-white shadow-xl shadow-slate-900/30 ring-1 ring-white/20 backdrop-blur-md transition-all duration-200 hover:bg-slate-800 hover:scale-105 active:scale-95 disabled:opacity-60"
        >
          <svg
            v-if="!isDownloading"
            class="h-4 w-4 stroke-[2.5]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          <svg
            v-else
            class="h-4 w-4 animate-spin text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>

          <span>{{ isDownloading ? "Downloading..." : "Download Slip" }}</span>
        </button>
      </div>
    </template>
  </div>
</template>