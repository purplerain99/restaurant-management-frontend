<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { getOrders, updateOrderStatus } from "../../services/order";
import echo from "@/services/echo";

const orders = ref([]);
const loading = ref(true);
const errorMessage = ref("");
const selectedStatus = ref("");
const search = ref("");

const statusList = [
  { value: "pending", label: "အသစ်" },
  { value: "confirmed", label: "အတည်ပြုပြီး" },
  { value: "preparing", label: "ချက်ပြုတ်နေသည်" },
  { value: "ready", label: "အသင့်ဖြစ်ပြီ" },
  { value: "served", label: "စားပွဲသို့ရောက်ပြီ" },
  { value: "completed", label: "ပြီးဆုံး" },
  { value: "cancelled", label: "ပယ်ဖျက်" },
];

const statusLabel = (status) => {
  const found = statusList.find((item) => item.value === status);
  return found?.label || status;
};

const statusClass = (status) => {
  return (
    {
      pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
      confirmed: "bg-blue-50 text-blue-700 ring-blue-700/10",
      preparing: "bg-purple-50 text-purple-700 ring-purple-700/10",
      ready: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
      served: "bg-cyan-50 text-cyan-700 ring-cyan-600/20",
      completed: "bg-slate-100 text-slate-700 ring-slate-600/10",
      cancelled: "bg-rose-50 text-rose-700 ring-rose-600/10",
    }[status] || "bg-slate-50 text-slate-600 ring-slate-500/10"
  );
};

const nextStatuses = (status) => {
  return (
    {
      pending: ["confirmed", "cancelled"],
      confirmed: ["preparing", "cancelled"],
      preparing: ["ready", "cancelled"],
      ready: ["served"],
      served: ["completed"],
      completed: [],
      cancelled: [],
    }[status] || []
  );
};

const loadOrders = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await getOrders({
      status: selectedStatus.value || undefined,
      search: search.value || undefined,
    });

    orders.value = response.data.data ?? [];
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Orders ရယူ၍မရပါ။";
  } finally {
    loading.value = false;
  }
};

const changeStatus = async (order, status) => {
  const confirmed = window.confirm(
    `${order.order_number} ကို ${statusLabel(
      status
    )} သို့ ပြောင်းမှာသေချာပါသလား?`
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await updateOrderStatus(order.id, status);
    const updatedOrder = response.data.order;
    const updatedOrderId = updatedOrder.id;

    const index = orders.value.findIndex((item) => item.id === updatedOrderId);

    if (index !== -1) {
      orders.value[index] = updatedOrder;
    }
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Status ပြောင်း၍မရပါ။";
  }
};

const handleRealtimeStatus = (event) => {
  const updatedOrder = event.order;

  if (!updatedOrder) return;

  const index = orders.value.findIndex((item) => item.id === updatedOrder.id);

  if (index !== -1) {
    orders.value[index] = {
      ...orders.value[index],
      ...updatedOrder,
    };
  } else {
    if (!selectedStatus.value || selectedStatus.value === updatedOrder.status) {
      orders.value.unshift(updatedOrder);
    }
  }
};

const handleNewOrder = (event) => {
  const order = event.order;

  if (!order) {
    console.warn("Realtime order payload မရှိပါ။", event);
    return;
  }

  if (!orders.value.some((item) => item.id === order.id)) {
    if (!selectedStatus.value || selectedStatus.value === order.status) {
      orders.value.unshift(order);
    }
  }
};

let channel = null;

onMounted(async () => {
  await loadOrders();

  channel = echo.private("restaurant.orders");
  channel.listen(".order.created", handleNewOrder);
  channel.listen(".order.status.updated", handleRealtimeStatus);
});

onBeforeUnmount(() => {
  echo.leave("restaurant.orders");
  channel = null;
});
</script>

<template>
  <div class="space-y-8 bg-slate-50/50 p-4 sm:p-6 lg:p-8 min-h-screen">
    <!-- Header -->
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <div class="flex items-center gap-3">
          <h1
            class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900"
          >
            Orders Dashboard
          </h1>
          <span
            class="inline-flex items-center gap-x-1.5 rounded-full bg-emerald-100/80 px-2.5 py-1 text-xs font-medium text-emerald-800"
          >
            <span
              class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"
            ></span>
            Real-time
          </span>
        </div>
        <p class="mt-1 text-sm text-slate-500">
          ဝင်ရောက်လာသော Order များကို တိုက်ရိုက် စောင့်ကြည့်စစီမံနိုင်ပါသည်။
        </p>
      </div>

      <button
        type="button"
        @click="loadOrders"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300/80 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-[0.98]"
      >
        <svg
          class="h-4 w-4 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
        Refresh
      </button>
    </div>

    <!-- Filters -->
    <div
      class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5 backdrop-blur-xl"
    >
      <div class="grid gap-3 md:grid-cols-2">
        <div class="relative">
          <div
            class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5"
          >
            <svg
              class="h-4 w-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
          <input
            v-model="search"
            @keyup.enter="loadOrders"
            type="search"
            placeholder="Order No. / Table / Guest ရှာမည်..."
            class="w-full rounded-xl border-0 py-2.5 pl-10 pr-4 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 transition-all"
          />
        </div>

        <div class="relative">
          <select
            v-model="selectedStatus"
            @change="loadOrders"
            class="w-full appearance-none rounded-xl border-0 py-2.5 pl-4 pr-10 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-slate-900 transition-all bg-white"
          >
            <option value="">Status အားလုံး</option>
            <option
              v-for="status in statusList"
              :key="status.value"
              :value="status.value"
            >
              {{ status.label }}
            </option>
          </select>
          <div
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5"
          >
            <svg
              class="h-4 w-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    <div
      v-if="errorMessage"
      class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-center gap-3 shadow-sm"
    >
      <svg
        class="h-5 w-5 text-rose-500 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z"
        />
      </svg>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="rounded-2xl bg-white p-16 text-center shadow-sm ring-1 ring-slate-900/5"
    >
      <div class="inline-flex items-center justify-center space-x-2">
        <div
          class="w-3 h-3 bg-slate-900 rounded-full animate-bounce [animation-delay:-0.3s]"
        ></div>
        <div
          class="w-3 h-3 bg-slate-900 rounded-full animate-bounce [animation-delay:-0.15s]"
        ></div>
        <div class="w-3 h-3 bg-slate-900 rounded-full animate-bounce"></div>
      </div>
      <p class="mt-4 text-sm font-medium text-slate-500">Orders ဖတ်နေသည်...</p>
    </div>

    <!-- Desktop Table -->
    <div
      v-else-if="orders.length"
      class="hidden lg:block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5"
    >
      <div class="overflow-x-auto">
        <table
          class="min-w-full divide-y divide-slate-200/80 text-left text-sm"
        >
          <thead class="bg-slate-50/70">
            <tr>
              <th
                scope="col"
                class="py-4 pl-6 pr-3 font-semibold text-slate-900"
              >
                Order
              </th>
              <th scope="col" class="px-3 py-4 font-semibold text-slate-900">
                Guest Name
              </th>
              <th scope="col" class="px-3 py-4 font-semibold text-slate-900">
                Guest Phone
              </th>
              <th scope="col" class="px-3 py-4 font-semibold text-slate-900">
                Table
              </th>
              <th scope="col" class="px-3 py-4 font-semibold text-slate-900">
                Items
              </th>
              <th scope="col" class="px-3 py-4 font-semibold text-slate-900">
                Total
              </th>
              <th scope="col" class="px-3 py-4 font-semibold text-slate-900">
                Status
              </th>
              <th
                scope="col"
                class="py-4 pl-3 pr-6 text-right font-semibold text-slate-900"
              >
                Action
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100 bg-white">
            <tr
              v-for="order in orders"
              :key="order.id"
              class="hover:bg-slate-50/60 transition-colors"
            >
              <!-- Order -->
              <td class="whitespace-nowrap py-4 pl-6 pr-3">
                <p class="font-bold text-slate-900 tracking-tight">
                  #{{ order.order_number }}
                </p>
                <p class="mt-0.5 text-xs text-slate-400">
                  {{
                    order.created_at
                      ? new Date(order.created_at).toLocaleString()
                      : "-"
                  }}
                </p>
              </td>

              <!-- Guest Name -->
              <td class="whitespace-nowrap px-3 py-4 text-slate-700">
                <span
                  v-if="order.guest_name"
                  class="font-medium text-slate-900"
                >
                  {{ order.guest_name }}
                </span>
                <span v-else class="text-slate-400 italic">မဖော်ပြထားပါ</span>
              </td>

              <!-- Guest Phone -->
              <td class="whitespace-nowrap px-3 py-4">
                <a
                  v-if="order.guest_phone"
                  :href="`tel:${order.guest_phone}`"
                  class="font-medium text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
                >
                  <svg
                    class="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.826-1.07-5.11-3.354-6.18-6.18l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25z"
                    />
                  </svg>
                  {{ order.guest_phone }}
                </a>
                <span v-else class="text-slate-400 italic">မဖော်ပြထားပါ</span>
              </td>

              <!-- Table -->
              <td
                class="whitespace-nowrap px-3 py-4 text-slate-700 font-medium"
              >
                <span
                  class="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700"
                >
                  {{ order.restaurant_table?.name ?? "-" }}
                </span>
              </td>

              <!-- Items -->
              <td class="px-3 py-4">
                <div class="space-y-1 max-w-[200px]">
                  <div
                    v-for="item in order.order_items ?? []"
                    :key="item.id"
                    class="text-xs text-slate-600 truncate"
                  >
                    <span class="font-semibold text-slate-800"
                      >{{ item.quantity }}x</span
                    >
                    {{ item.menu_item_name }}
                  </div>
                </div>
              </td>

              <!-- Total -->
              <td class="whitespace-nowrap px-3 py-4 font-bold text-slate-900">
                {{ Number(order.grand_total ?? 0).toLocaleString() }}
                <span class="text-xs font-normal text-slate-500">MMK</span>
              </td>

              <!-- Status -->
              <td class="whitespace-nowrap px-3 py-4">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
                  :class="statusClass(order.status)"
                >
                  {{ statusLabel(order.status) }}
                </span>
              </td>

              <!-- Action -->
              <td class="whitespace-nowrap py-4 pl-3 pr-6 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    v-for="status in nextStatuses(order.status)"
                    :key="status"
                    type="button"
                    @click="changeStatus(order, status)"
                    class="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 transition-all active:scale-[0.96]"
                  >
                    {{ statusLabel(status) }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Cards -->
    <div v-else-if="orders?.length" class="space-y-4 lg:hidden">
      <div
        v-for="order in orders"
        :key="order.id"
        class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5 transition-all"
      >
        <!-- Header -->
        <div
          class="flex items-start justify-between gap-4 pb-3 border-b border-slate-100"
        >
          <div>
            <span
              class="text-xs font-semibold text-slate-400 uppercase tracking-wider"
              >Order No</span
            >
            <p class="text-lg font-extrabold text-slate-900">
              #{{ order.order_number }}
            </p>
          </div>

          <span
            class="rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset"
            :class="statusClass(order.status)"
          >
            {{ statusLabel(order.status) }}
          </span>
        </div>

        <!-- Guest & Table Details -->
        <div
          class="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50/80 p-3.5"
        >
          <div>
            <p
              class="text-[11px] font-semibold uppercase tracking-wider text-slate-400"
            >
              Guest
            </p>
            <p class="mt-0.5 text-sm font-semibold text-slate-800 truncate">
              {{ order.guest_name || "မဖော်ပြထားပါ" }}
            </p>
            <a
              v-if="order.guest_phone"
              :href="`tel:${order.guest_phone}`"
              class="text-xs font-medium text-blue-600 hover:underline block truncate"
            >
              {{ order.guest_phone }}
            </a>
          </div>

          <div>
            <p
              class="text-[11px] font-semibold uppercase tracking-wider text-slate-400"
            >
              Table
            </p>
            <p class="mt-0.5 text-sm font-semibold text-slate-800">
              {{ order.restaurant_table?.name ?? "-" }}
            </p>
          </div>
        </div>

        <!-- Items -->
        <div class="mt-4 space-y-2">
          <p
            class="text-xs font-semibold text-slate-400 uppercase tracking-wider"
          >
            Items
          </p>
          <div
            v-for="item in order.order_items ?? []"
            :key="item.id"
            class="flex items-center justify-between text-sm py-0.5"
          >
            <span class="text-slate-600">
              <span class="font-bold text-slate-900">{{ item.quantity }}x</span>
              {{ item.menu_item_name }}
            </span>

            <span class="font-medium text-slate-900">
              {{ Number(item.subtotal ?? 0).toLocaleString() }}
            </span>
          </div>
        </div>

        <!-- Total -->
        <div class="mt-4 border-t border-slate-100 pt-3">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold text-slate-500"
              >Total Amount</span
            >
            <span class="text-lg font-extrabold text-slate-900">
              {{ Number(order.grand_total ?? 0).toLocaleString() }}
              <span class="text-xs font-normal text-slate-500">MMK</span>
            </span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div
          v-if="nextStatuses(order.status).length"
          class="mt-4 flex flex-wrap gap-2 pt-2 border-t border-slate-100"
        >
          <button
            v-for="status in nextStatuses(order.status)"
            :key="status"
            type="button"
            @click="changeStatus(order, status)"
            class="flex-1 rounded-xl bg-slate-900 py-2.5 px-3 text-center text-xs font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-[0.98] transition-all"
          >
            {{ statusLabel(status) }} သို့ပြောင်းရန်
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!loading"
      class="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center"
    >
      <div
        class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-3xl"
      >
        🧾
      </div>
      <h3 class="mt-4 text-base font-bold text-slate-900">Order မရှိသေးပါ</h3>
      <p class="mt-1 text-sm text-slate-500">
        Customer Order တင်လာသည့်အခါ ဒီနေရာတွင် အလိုအလျောက် ပေါ်လာပါမည်။
      </p>
    </div>
  </div>
</template>