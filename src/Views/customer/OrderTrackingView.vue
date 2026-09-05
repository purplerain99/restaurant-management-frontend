<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, RouterLink } from "vue-router";

import { trackOrder } from "@/services/order";
import echo from "@/services/echo";

import OrderStatusTimeline from "@/components/orders/OrderStatusTimeline.vue";

const route = useRoute();

const order = ref(null);
const loading = ref(true);
const errorMessage = ref("");

const realtimeConnected = ref(false);
const realtimeError = ref("");

let channel = null;
let channelName = null;

const formatPrice = (value) => {
  return Number(value ?? 0).toLocaleString();
};

const statusLabel = (status) => {
  const map = {
    pending: "Order လက်ခံရရှိပါပြီ",
    confirmed: "Order အတည်ပြုပြီးပါပြီ",
    preparing: "အစားအစာ ပြင်ဆင်နေပါသည်",
    ready: "အစားအစာ အသင့်ဖြစ်ပါပြီ",
    served: "စားပွဲသို့ ပို့ပြီးပါပြီ",
    completed: "Order ပြီးဆုံးပါပြီ",
    cancelled: "Order ပယ်ဖျက်ထားပါသည်",
  };

  return map[status] || status;
};

const loadOrder = async () => {
  try {
    const response = await trackOrder(route.params.tracking_token);

    // Laravel Resource response ဖြစ်နိုင်လို့ data.data / data နှစ်မျိုးစစ်
    order.value = response.data?.data ?? response.data;

    console.log("TRACK ORDER:", order.value);
  } catch (error) {
    console.error("TRACK ORDER ERROR:", error);

    errorMessage.value =
      error.response?.data?.message || "Order tracking မရရှိပါ။";

    throw error;
  }
};

const handleStatusUpdate = (event) => {
  console.log("REALTIME STATUS EVENT:", event);

  if (!order.value) {
    return;
  }

  const updatedOrder = event.order;

  if (!updatedOrder?.tracking_token) {
    console.warn("tracking_token မပါသော realtime event:", event);
    return;
  }

  if (updatedOrder.tracking_token !== order.value.tracking_token) {
    console.log("Different tracking token");
    return;
  }

  order.value = {
    ...order.value,
    status: updatedOrder.status,
    updated_at: updatedOrder.updated_at,
  };

  console.log(
    `Order ${updatedOrder.order_number} status => ${updatedOrder.status}`
  );
};

const setupRealtime = () => {
  if (!order.value?.tracking_token) {
    console.warn("tracking_token မရှိလို့ realtime မချိတ်နိုင်ပါ။");
    return;
  }

  channelName = `orders.${order.value.tracking_token}`;

  console.log("SUBSCRIBING TO PUBLIC CHANNEL:", channelName);

  channel = echo
    .channel(channelName)
    .subscribed(() => {
      realtimeConnected.value = true;
      realtimeError.value = "";
      console.log("REALTIME CONNECTED:", channelName);
    })
    .error((error) => {
      realtimeConnected.value = false;
      console.error("REALTIME CHANNEL ERROR:", error);
      realtimeError.value = "Realtime connection မအောင်မြင်ပါ။";
    })
    .listen(".order.status.updated", handleStatusUpdate);

  console.log("PUBLIC CHANNEL CREATED:", channelName);
};

onMounted(async () => {
  try {
    await loadOrder();
    setupRealtime();
  } catch (error) {
    console.error("ORDER TRACKING PAGE ERROR:", error);
  } finally {
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  if (channelName) {
    console.log("LEAVING CHANNEL:", channelName);
    echo.leave(channelName);
  }

  channel = null;
  channelName = null;
  realtimeConnected.value = false;
});
</script>

<template>
  <div class="mx-auto max-w-lg space-y-5 p-4 sm:p-6 pb-12">
    <!-- Top Back Navigation -->
    <div class="flex items-center justify-between">
      <button
        type="button"
        @click="$router.back()"
        class="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:text-indigo-600 active:scale-95"
      >
        <svg
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
        <span>နောက်သို့ ပြန်သွားမည်</span>
      </button>

      <!-- Live Indicator Header Badges -->
      <div
        v-if="order"
        class="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1 text-xs shadow-sm"
      >
        <span class="relative flex h-2 w-2">
          <span
            v-if="realtimeConnected"
            class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
          ></span>
          <span
            class="relative inline-flex h-2 w-2 rounded-full"
            :class="realtimeConnected ? 'bg-emerald-500' : 'bg-slate-300'"
          ></span>
        </span>
        <span
          class="text-[11px] font-bold"
          :class="realtimeConnected ? 'text-slate-700' : 'text-slate-400'"
        >
          {{ realtimeConnected ? "Live Update" : "Connecting..." }}
        </span>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div
      v-if="loading"
      class="rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-sm space-y-4"
    >
      <div
        class="mx-auto h-12 w-12 animate-pulse rounded-full bg-slate-100"
      ></div>
      <div class="mx-auto h-4 w-1/2 animate-pulse rounded bg-slate-100"></div>
      <div class="mx-auto h-6 w-1/3 animate-pulse rounded bg-slate-100"></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="errorMessage"
      class="rounded-3xl border border-rose-200 bg-rose-50/80 p-8 text-center shadow-sm"
    >
      <div
        class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-3xl"
      >
        ⚠️
      </div>
      <h2 class="mt-4 text-base font-bold text-rose-900">
        အမှားတစ်ခု ဖြစ်ပေါ်နေပါသည်
      </h2>
      <p class="mt-1 text-xs text-rose-700">
        {{ errorMessage }}
      </p>
    </div>

    <!-- Main Content -->
    <template v-else-if="order">
      <!-- Connection Error Alert -->
      <div
        v-if="realtimeError"
        class="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-center text-xs text-amber-700"
      >
        {{ realtimeError }}
      </div>

      <!-- Order Header Banner -->
      <section
        class="rounded-3xl border border-slate-200/80 bg-white p-6 text-center shadow-sm"
      >
        <span
          class="text-[11px] font-bold tracking-wider uppercase text-slate-400"
          >Order Tracking</span
        >

        <h1
          class="mt-1 font-mono text-2xl sm:text-3xl font-black tracking-tight text-slate-900"
        >
          #{{ order.order_number }}
        </h1>

        <p class="mt-1 text-xs font-semibold text-slate-500">
          Table:
          <span class="text-slate-800 font-bold">{{
            order.table?.name || "N/A"
          }}</span>
        </p>

        <!-- Dynamic Status Tag -->
        <div class="mt-4">
          <span
            class="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-slate-900/10"
          >
            {{ statusLabel(order.status) }}
          </span>
        </div>
      </section>

      <!-- Timeline Progress Component -->
      <section
        class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm"
      >
        <OrderStatusTimeline :status="order.status" />
      </section>

      <!-- Items Breakdown Card -->
      <section
        class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4"
      >
        <h2 class="text-xs font-bold tracking-wider text-slate-400 uppercase">
          သင့် Order အသေးစိတ်
        </h2>

        <div class="divide-y divide-slate-100">
          <div
            v-for="item in order.items || []"
            :key="item.id"
            class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
          >
            <div class="flex items-start gap-3 min-w-0">
              <span
                class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600 mt-0.5"
              >
                {{ item.quantity }}x
              </span>

              <div class="min-w-0">
                <p class="text-sm font-bold text-slate-800 line-clamp-1">
                  {{ item.menu_item_name }}
                </p>
                <p class="text-[11px] font-medium text-slate-400">
                  {{ formatPrice(item.unit_price) }} MMK
                </p>
              </div>
            </div>

            <p class="text-sm font-extrabold text-slate-900 shrink-0">
              {{ formatPrice(item.subtotal) }}
              <span class="text-[10px] font-bold text-indigo-600">MMK</span>
            </p>
          </div>
        </div>

        <!-- Grand Total Summary -->
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
    </template>
  </div>
</template>