<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import { getKitchenOrders, updateOrderStatus } from "../../services/order";

import echo from "@/services/echo";

const orders = ref([]);

const loading = ref(true);

const errorMessage = ref("");

let channel = null;

const pendingOrders = computed(() => {
  return orders.value.filter((order) =>
    ["pending", "confirmed"].includes(order.status)
  );
});

const preparingOrders = computed(() => {
  return orders.value.filter((order) => order.status === "preparing");
});

const readyOrders = computed(() => {
  return orders.value.filter((order) => order.status === "ready");
});

const loadOrders = async () => {
  loading.value = true;

  try {
    const response = await getKitchenOrders();

    orders.value = response.data.data;
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Kitchen orders ရယူ၍မရပါ။";
  } finally {
    loading.value = false;
  }
};

const nextStatus = (status) => {
  if (status === "pending") {
    return "confirmed";
  }

  if (status === "confirmed") {
    return "preparing";
  }

  if (status === "preparing") {
    return "ready";
  }

  if (status === "ready") {
    return "served";
  }

  return null;
};

const actionLabel = (status) => {
  const labels = {
    pending: "Order လက်ခံမည်",

    confirmed: "ချက်ပြုတ်မည်",

    preparing: "အသင့်ဖြစ်ပြီ",

    ready: "Served",
  };

  return labels[status];
};

const changeStatus = async (order) => {
  const status = nextStatus(order.status);

  if (!status) {
    return;
  }

  try {
    const response = await updateOrderStatus(order.id, status);

    console.log("STATUS UPDATE RESPONSE:", response.data);

    /*
    |--------------------------------------------------------------------------
    | Backend response structure
    |--------------------------------------------------------------------------
    |
    | API က တစ်ခါတလေ
    |
    | { data: { ... } }
    |
    | ဒါမှမဟုတ်
    |
    | { order: { ... } }
    |
    | ဒါမှမဟုတ်
    |
    | { ...order }
    |
    | ပုံစံဖြစ်နိုင်လို့ normalize လုပ်မယ်။
    |--------------------------------------------------------------------------
    */

    const updated =
      response.data?.order ??
      response.data?.data?.order ??
      response.data?.data ??
      response.data;

    if (!updated || !updated.id) {
      console.error("Updated order data မရပါ:", response.data);

      errorMessage.value = "Order update response မမှန်ပါ။";

      return;
    }

    const index = orders.value.findIndex((item) => item.id === updated.id);

    /*
    |--------------------------------------------------------------------------
    | Served ဖြစ်သွားရင် KDS မှာ remove
    |--------------------------------------------------------------------------
    */

    if (["served", "completed", "cancelled"].includes(updated.status)) {
      if (index !== -1) {
        orders.value.splice(index, 1);
      }

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Existing order update
    |--------------------------------------------------------------------------
    */

    if (index !== -1) {
      orders.value[index] = {
        ...orders.value[index],
        ...updated,
      };
    } else {
      /*
      | API response က full order မဟုတ်ရင်
      | existing order ကို fallback အဖြစ် update လုပ်မယ်။
      */

      const originalIndex = orders.value.findIndex(
        (item) => item.id === order.id
      );

      if (originalIndex !== -1) {
        orders.value[originalIndex] = {
          ...orders.value[originalIndex],
          status: updated.status,
          updated_at: updated.updated_at,
        };
      } else {
        await loadOrders();
      }
    }
  } catch (error) {
    console.error("STATUS UPDATE ERROR:", error);

    errorMessage.value =
      error.response?.data?.message || "Status ပြောင်း၍မရပါ။";
  }
};

const addRealtimeOrder = (event) => {
  const newOrder = event.order;

  if (
    !["pending", "confirmed", "preparing", "ready"].includes(newOrder.status)
  ) {
    return;
  }

  const exists = orders.value.some((order) => order.id === newOrder.id);

  if (!exists) {
    orders.value.unshift(newOrder);
  }
};

const updateRealtimeOrder = (event) => {
  console.log("REALTIME ORDER STATUS EVENT:", event);

  /*
  |--------------------------------------------------------------------------
  | Event payload ကို normalize
  |--------------------------------------------------------------------------
  */

  const updated = event?.order ?? event?.data?.order ?? event?.data ?? event;

  if (!updated || !updated.id) {
    console.warn("Realtime event ထဲမှာ valid order မပါပါ:", event);

    /*
    | id မပါတဲ့ status-only event ဖြစ်ရင်
    | tracking_token / order_number နဲ့ရှာကြည့်မယ်။
    */

    const trackingToken = event?.tracking_token;

    const orderNumber = event?.order_number;

    const fallbackIndex = orders.value.findIndex(
      (order) =>
        (trackingToken && order.tracking_token === trackingToken) ||
        (orderNumber && order.order_number === orderNumber)
    );

    if (fallbackIndex !== -1) {
      orders.value[fallbackIndex] = {
        ...orders.value[fallbackIndex],
        status: event.status,
        updated_at: event.updated_at,
      };
    }

    return;
  }

  const index = orders.value.findIndex((order) => order.id === updated.id);

  /*
  |--------------------------------------------------------------------------
  | Remove finished orders
  |--------------------------------------------------------------------------
  */

  if (["served", "completed", "cancelled"].includes(updated.status)) {
    if (index !== -1) {
      orders.value.splice(index, 1);
    }

    return;
  }

  /*
  |--------------------------------------------------------------------------
  | Update existing order
  |--------------------------------------------------------------------------
  */

  if (index !== -1) {
    orders.value[index] = {
      ...orders.value[index],
      ...updated,
    };

    return;
  }

  /*
  |--------------------------------------------------------------------------
  | Order မရှိသေးရင် reload
  |--------------------------------------------------------------------------
  */

  console.log("Realtime order မတွေ့ပါ။ Orders ပြန် load လုပ်မယ်။");

  loadOrders();
};

onMounted(async () => {
  await loadOrders();

  channel = echo.private("kitchen.orders");

  channel.listen(".order.created", addRealtimeOrder);

  channel.listen(".order.status.updated", updateRealtimeOrder);
});

onBeforeUnmount(() => {
  echo.leave("private-kitchen.orders");
});
</script>


<template>
  <div class="min-h-screen space-y-6">
    <!-- Header -->

    <header
      class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-black text-slate-900">🍳 Kitchen</h1>

          <span
            class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700"
          >
            LIVE
          </span>
        </div>

        <p class="mt-1 text-sm text-slate-500">Kitchen Display System</p>
      </div>

      <button
        type="button"
        @click="loadOrders"
        class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
      >
        Refresh
      </button>
    </header>

    <!-- Error -->

    <div
      v-if="errorMessage"
      class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ errorMessage }}
    </div>

    <!-- Loading -->

    <div v-if="loading" class="rounded-3xl bg-white p-12 text-center shadow-sm">
      Kitchen Orders ဖတ်နေသည်...
    </div>

    <!-- KDS -->

    <div v-else class="grid gap-5 xl:grid-cols-3">
      <!-- Pending -->

      <section class="rounded-3xl bg-slate-100 p-4">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-black text-slate-900">Pending</h2>

            <p class="text-xs text-slate-500">New Orders</p>
          </div>

          <span
            class="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700"
          >
            {{ pendingOrders.length }}
          </span>
        </div>

        <div class="space-y-4">
          <article
            v-for="order in pendingOrders"
            :key="order.id"
            class="rounded-2xl bg-white p-5 shadow-sm"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-mono font-bold">
                  {{ order.order_number }}
                </p>

                <p class="mt-1 text-sm font-semibold text-slate-600">
                  {{ order.restaurant_table?.name }}
                </p>
              </div>

              <span
                class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700"
              >
                {{ order.status }}
              </span>
            </div>

            <div class="mt-4 space-y-3">
              <div
                v-for="item in order.order_items"
                :key="item.id"
                class="rounded-xl bg-slate-50 p-3"
              >
                <div class="flex gap-3">
                  <span
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white"
                  >
                    {{ item.quantity }}
                  </span>

                  <div>
                    <p class="font-semibold">
                      {{ item.menu_item_name }}
                    </p>

                    <p
                      v-if="item.special_note"
                      class="mt-1 text-xs font-medium text-red-600"
                    >
                      Note:
                      {{ item.special_note }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              @click="changeStatus(order)"
              class="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white"
            >
              {{ actionLabel(order.status) }}
            </button>
          </article>

          <div
            v-if="!pendingOrders.length"
            class="rounded-2xl border border-dashed border-slate-300 p-8 text-center"
          >
            <p class="text-sm text-slate-500">New Order မရှိပါ။</p>
          </div>
        </div>
      </section>

      <!-- Preparing -->

      <section class="rounded-3xl bg-violet-50 p-4">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-black">Preparing</h2>

            <p class="text-xs text-slate-500">Cooking</p>
          </div>

          <span
            class="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700"
          >
            {{ preparingOrders.length }}
          </span>
        </div>

        <div class="space-y-4">
          <article
            v-for="order in preparingOrders"
            :key="order.id"
            class="rounded-2xl bg-white p-5 shadow-sm"
          >
            <div class="flex justify-between gap-3">
              <div>
                <p class="font-mono font-bold">
                  {{ order.order_number }}
                </p>

                <p class="mt-1 text-sm font-semibold text-slate-600">
                  {{ order.restaurant_table?.name }}
                </p>
              </div>

              <span
                class="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700"
              >
                Preparing
              </span>
            </div>

            <div class="mt-4 space-y-2">
              <div
                v-for="item in order.order_items"
                :key="item.id"
                class="flex gap-3"
              >
                <span class="font-black"> {{ item.quantity }}× </span>

                <span class="text-sm">
                  {{ item.menu_item_name }}
                </span>
              </div>
            </div>

            <button
              type="button"
              @click="changeStatus(order)"
              class="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-700"
            >
              အသင့်ဖြစ်ပြီ
            </button>
          </article>

          <div
            v-if="!preparingOrders.length"
            class="rounded-2xl border border-dashed border-violet-200 p-8 text-center"
          >
            <p class="text-sm text-slate-500">ချက်ပြုတ်နေသော Order မရှိပါ။</p>
          </div>
        </div>
      </section>

      <!-- Ready -->

      <section class="rounded-3xl bg-emerald-50 p-4">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-black">Ready</h2>

            <p class="text-xs text-slate-500">Ready to Serve</p>
          </div>

          <span
            class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700"
          >
            {{ readyOrders.length }}
          </span>
        </div>

        <div class="space-y-4">
          <article
            v-for="order in readyOrders"
            :key="order.id"
            class="rounded-2xl bg-white p-5 shadow-sm"
          >
            <p class="font-mono font-bold">
              {{ order.order_number }}
            </p>

            <p class="mt-1 text-sm font-semibold text-slate-600">
              {{ order.restaurant_table?.name }}
            </p>

            <div class="mt-4 space-y-2">
              <div
                v-for="item in order.order_items"
                :key="item.id"
                class="text-sm"
              >
                <span class="font-black"> {{ item.quantity }}× </span>

                {{ item.menu_item_name }}
              </div>
            </div>

            <button
              type="button"
              @click="changeStatus(order)"
              class="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white"
            >
              Served
            </button>
          </article>

          <div
            v-if="!readyOrders.length"
            class="rounded-2xl border border-dashed border-emerald-200 p-8 text-center"
          >
            <p class="text-sm text-slate-500">အသင့်ဖြစ်နေသော Order မရှိပါ။</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>