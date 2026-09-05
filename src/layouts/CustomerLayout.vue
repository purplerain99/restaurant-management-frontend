<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";

import { getPublicTable } from "@/services/tables";
import { useCartStore } from "@/stores/cart";

const route = useRoute();
const router = useRouter();

const cart = useCartStore();

const table = ref(null);
const loading = ref(true);
const errorMessage = ref("");

const tableCode = computed(() => {
  return route.params.table_code;
});

/*
|--------------------------------------------------------------------------
| Setup Cart
|--------------------------------------------------------------------------
*/
const setupCart = () => {
  const code = route.params.table_code;

  if (!code) {
    return;
  }

  cart.setTable(code);
};

/*
|--------------------------------------------------------------------------
| Load Table
|--------------------------------------------------------------------------
*/
const loadTable = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await getPublicTable(tableCode.value);

    table.value = response.data;

    if (response.data?.table_code) {
      cart.setTable(response.data.table_code);
    }
  } catch (error) {
    console.error("TABLE ERROR:", error);

    errorMessage.value =
      error.response?.data?.message || "စားပွဲအချက်အလက် ရယူ၍မရပါ။";
  } finally {
    loading.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Go To Cart
|--------------------------------------------------------------------------
*/
const goToCart = () => {
  router.push({
    name: "customer.cart",
    params: {
      table_code: tableCode.value,
    },
  });
};

/*
|--------------------------------------------------------------------------
| Initial Load
|--------------------------------------------------------------------------
*/
onMounted(async () => {
  setupCart();
  await loadTable();
});

/*
|--------------------------------------------------------------------------
| Table Code Changed
|--------------------------------------------------------------------------
*/
watch(
  () => route.params.table_code,
  async (newCode, oldCode) => {
    if (!newCode || newCode === oldCode) {
      return;
    }

    setupCart();
    await loadTable();
  }
);
</script>

<template>
  <div
    class="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white"
  >
    <!-- Sticky Header -->
    <header
      class="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-all"
    >
      <div
        class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6"
      >
        <!-- Logo & Table Info -->
        <RouterLink
          :to="{
            name: 'customer.menu',
            params: {
              table_code: tableCode,
            },
          }"
          class="group flex items-center gap-3"
        >
          <div
            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-black text-white shadow-md shadow-indigo-600/20 transition-transform duration-200 group-hover:scale-105 active:scale-95"
          >
            R
          </div>

          <div class="flex flex-col">
            <span
              class="text-sm font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors"
            >
              Restaurant
            </span>

            <!-- Table Badge -->
            <div v-if="table" class="flex items-center gap-1.5">
              <span
                class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
              ></span>
              <span class="text-xs font-semibold text-slate-500">
                {{ table.name }}
              </span>
            </div>
            <span
              v-else-if="loading"
              class="h-3 w-16 animate-pulse rounded bg-slate-200 mt-1"
            ></span>
          </div>
        </RouterLink>

        <!-- Top Navigation Cart Button -->
        <button
          type="button"
          @click="goToCart"
          class="relative flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:bg-slate-50 hover:text-indigo-600 active:scale-95"
        >
          <svg
            class="h-4 w-4 stroke-[2.2]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>

          <span>Cart</span>

          <span
            v-if="cart.totalQuantity > 0"
            class="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[11px] font-black text-white shadow-sm shadow-indigo-600/30"
          >
            {{ cart.totalQuantity }}
          </span>
        </button>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="mx-auto max-w-lg px-4 py-24 text-center">
      <div class="relative mx-auto flex h-16 w-16 items-center justify-center">
        <div
          class="absolute h-full w-full animate-ping rounded-full bg-indigo-400/20"
        ></div>
        <div
          class="h-10 w-10 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent"
        ></div>
      </div>
      <p class="mt-4 text-xs font-bold tracking-wider uppercase text-slate-400">
        Table အချက်အလက် စစ်ဆေးနေသည်...
      </p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="mx-auto max-w-md px-4 py-16">
      <div
        class="rounded-3xl border border-rose-200 bg-rose-50/80 p-8 text-center shadow-sm backdrop-blur-sm"
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
    </div>

    <!-- Child View -->
    <main v-else class="mx-auto max-w-6xl px-4 py-6 pb-36 sm:px-6">
      <RouterView />
    </main>

    <!-- Floating Bottom Cart Bar -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-12 opacity-0 scale-95"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100 scale-100"
      leave-to-class="translate-y-12 opacity-0 scale-95"
    >
      <div
        v-if="!loading && cart.totalQuantity > 0"
        class="fixed bottom-5 left-0 right-0 z-40 px-4"
      >
        <button
          type="button"
          @click="goToCart"
          class="group mx-auto flex w-full max-w-md items-center justify-between rounded-2xl bg-indigo-600 p-4 text-white shadow-xl shadow-indigo-600/30 ring-1 ring-white/20 transition-all duration-200 hover:bg-indigo-500 active:scale-[0.98]"
        >
          <!-- Left: Quantity Indicator -->
          <div class="flex items-center gap-3">
            <span
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-sm font-black backdrop-blur-md"
            >
              {{ cart.totalQuantity }}
            </span>
            <span class="text-xs font-bold tracking-wide uppercase">
              Items Selected
            </span>
          </div>

          <!-- Right: Price & CTA -->
          <div class="flex items-center gap-2">
            <div class="text-right">
              <span class="text-base font-black">
                {{ Number(cart.subtotal).toLocaleString() }}
              </span>
              <span class="ml-1 text-[10px] font-bold opacity-80">MMK</span>
            </div>

            <div
              class="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 transition-transform duration-200 group-hover:translate-x-1"
            >
              <svg
                class="h-4 w-4 stroke-[3]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </div>
          </div>
        </button>
      </div>
    </transition>
  </div>
</template>