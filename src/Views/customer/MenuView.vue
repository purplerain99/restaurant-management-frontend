<script setup>
import { computed, onMounted, ref } from "vue";

import { useRoute } from "vue-router";

import { getPublicCategories, getPublicMenuItems } from "@/services/menu";

import { useCartStore } from "@/stores/cart";

import { imageUrl } from "@/stores/url";

const route = useRoute();
const cart = useCartStore();

const categories = ref([]);
const menuItems = ref([]);

const selectedCategory = ref(null);
const search = ref("");

const loading = ref(true);
const errorMessage = ref("");

const tableCode = computed(() => {
  return route.params.table_code;
});

/*
|--------------------------------------------------------------------------
| Load Categories
|--------------------------------------------------------------------------
*/

const loadCategories = async () => {
  const response = await getPublicCategories();
  categories.value = response.data?.items ?? response.data?.data ?? [];
};

/*
|--------------------------------------------------------------------------
| Load Menu
|--------------------------------------------------------------------------
*/

const loadMenu = async () => {
  const params = {};

  if (selectedCategory.value !== null && selectedCategory.value !== undefined) {
    params.category_id = selectedCategory.value;
  }

  if (search.value.trim()) {
    params.search = search.value.trim();
  }

  const response = await getPublicMenuItems(params);
  menuItems.value = response.data?.data ?? response.data?.items ?? [];
};

/*
|--------------------------------------------------------------------------
| Load Everything
|--------------------------------------------------------------------------
*/

const loadData = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    cart.setTable(tableCode.value);
    await loadCategories();
    await loadMenu();
  } catch (error) {
    console.error("Menu Load Error:", error);
    errorMessage.value =
      error.response?.data?.message || error.message || "Menu ကို ရယူ၍မရပါ။";
  } finally {
    loading.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Select Category
|--------------------------------------------------------------------------
*/

const selectCategory = async (categoryId) => {
  selectedCategory.value = categoryId;
  loading.value = true;
  errorMessage.value = "";

  try {
    await loadMenu();
  } catch (error) {
    console.error("Category Filter Error:", error);
    errorMessage.value = error.response?.data?.message || "Menu ကို ရယူ၍မရပါ။";
  } finally {
    loading.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Search Menu
|--------------------------------------------------------------------------
*/

const searchMenu = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    await loadMenu();
  } catch (error) {
    console.error("Search Error:", error);
    errorMessage.value = error.response?.data?.message || "Menu ရှာ၍မရပါ။";
  } finally {
    loading.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Add To Cart
|--------------------------------------------------------------------------
*/

const addToCart = (item) => {
  cart.addItem(item);
};

/*
|--------------------------------------------------------------------------
| Format Price
|--------------------------------------------------------------------------
*/

const formatPrice = (value) => {
  return Number(value).toLocaleString();
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="space-y-6 pb-24 max-w-7xl mx-auto p-4 sm:p-6">
    <!-- Header -->
    <section
      class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-xl sm:p-8"
    >
      <div
        class="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div>
          <span
            class="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur-md"
          >
            <span
              class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"
            ></span>
            Table Code: {{ tableCode }}
          </span>
          <h1 class="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            ဘာစားမလဲ? 🍽️
          </h1>
          <p class="mt-1 text-sm text-slate-300">
            နှစ်သက်ရာ အစားအသောက်များကို ရွေးချယ်မှာယူနိုင်ပါသည်။
          </p>
        </div>
      </div>
      <!-- Decorative Background Glow -->
      <div
        class="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"
      ></div>
      <div
        class="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl"
      ></div>
    </section>

    <!-- Search -->
    <section>
      <div class="relative flex items-center gap-2">
        <div class="relative flex-1">
          <div
            class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4"
          >
            <svg
              class="h-5 w-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <input
            v-model="search"
            @keyup.enter="searchMenu"
            type="search"
            placeholder="Menu အမျိုးအစားများ ရှာမည်..."
            class="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3.5 text-sm text-slate-800 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/10"
          />
        </div>

        <button
          type="button"
          @click="searchMenu"
          class="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition duration-200 hover:bg-indigo-500 active:scale-95 shrink-0"
        >
          ရှာမည်
        </button>
      </div>
    </section>

    <!-- Categories -->
    <section>
      <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <!-- All -->
        <button
          type="button"
          @click="selectCategory(null)"
          class="shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95"
          :class="
            selectedCategory === null
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          "
        >
          အားလုံး
        </button>

        <!-- Dynamic Categories -->
        <button
          v-for="category in categories"
          :key="category.id"
          type="button"
          @click="selectCategory(category.id)"
          class="shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95"
          :class="
            selectedCategory === category.id
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          "
        >
          {{ category.name }}
        </button>
      </div>
    </section>

    <!-- Error Alert -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 -translate-y-2"
      enter-to-class="transform opacity-100 translate-y-0"
    >
      <div
        v-if="errorMessage"
        class="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-800 shadow-sm backdrop-blur-sm"
      >
        <svg
          class="h-5 w-5 text-rose-600 shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
        <div>
          <p class="font-bold">Menu Error</p>
          <p class="mt-0.5 text-xs text-rose-700">{{ errorMessage }}</p>
        </div>
      </div>
    </transition>

    <!-- Skeleton Loading -->
    <div v-if="loading" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="n in 6"
        :key="n"
        class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"
      >
        <div class="aspect-[4/3] animate-pulse bg-slate-200/80"></div>
        <div class="space-y-3 p-5">
          <div class="h-3 w-1/4 animate-pulse rounded bg-slate-200/80"></div>
          <div class="h-5 w-3/4 animate-pulse rounded bg-slate-200/80"></div>
          <div class="h-4 w-full animate-pulse rounded bg-slate-200/80"></div>
          <div class="pt-2 flex items-center justify-between">
            <div class="h-6 w-1/3 animate-pulse rounded bg-slate-200/80"></div>
            <div
              class="h-10 w-24 animate-pulse rounded-xl bg-slate-200/80"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Menu Grid -->
    <div
      v-else-if="menuItems.length > 0"
      class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      <article
        v-for="item in menuItems"
        :key="item.id"
        class="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300 flex flex-col justify-between"
      >
        <div>
          <!-- Image Container -->
          <div class="relative aspect-[4/3] overflow-hidden bg-slate-100">
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.name"
              class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div
              v-else
              class="flex h-full items-center justify-center text-5xl bg-slate-50 text-slate-300"
            >
              🍽️
            </div>

            <div v-if="item.category" class="absolute top-3 left-3">
              <span
                class="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-md"
              >
                {{ item.category.name }}
              </span>
            </div>
          </div>

          <!-- Content -->
          <div class="p-5">
            <h2
              class="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition duration-200"
            >
              {{ item.name }}
            </h2>

            <p
              v-if="item.description"
              class="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500"
            >
              {{ item.description }}
            </p>
          </div>
        </div>

        <!-- Price & Action -->
        <div class="p-5 pt-0">
          <div
            class="flex items-center justify-between gap-3 border-t border-slate-100 pt-4"
          >
            <div>
              <span class="text-xl font-black text-slate-900">
                {{ formatPrice(item.price) }}
              </span>
              <span class="ml-1 text-xs font-bold text-indigo-600"> MMK </span>
            </div>

            <button
              type="button"
              @click="addToCart(item)"
              class="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-indigo-600 active:scale-95"
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
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              <span>Cart</span>
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!loading && !errorMessage"
      class="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm"
    >
      <div
        class="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 text-4xl"
      >
        🍽️
      </div>
      <h2 class="mt-4 text-base font-bold text-slate-900">Menu မရှိသေးပါ</h2>
      <p class="mt-1 text-xs text-slate-500">
        ရွေးချယ်ထားသော Category သို့မဟုတ် ရှာဖွေမှုအောက်တွင် Item မရှိပါ။
      </p>
    </div>

    <!-- Floating Bottom Cart Button -->
    <Teleport to="body">
      <transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="transform translate-y-full opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform translate-y-full opacity-0"
      >
        <div
          v-if="cart.totalQuantity > 0"
          class="fixed bottom-5 left-0 right-0 z-40 px-4 pointer-events-none"
        >
          <button
            type="button"
            @click="
              $router.push({
                name: 'customer.cart',
                params: {
                  table_code: tableCode,
                },
              })
            "
            class="pointer-events-auto mx-auto flex w-full max-w-lg items-center justify-between rounded-2xl bg-indigo-600 px-5 py-4 text-white shadow-xl shadow-indigo-600/30 transition-all duration-200 hover:bg-indigo-500 active:scale-95"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 font-bold text-sm backdrop-blur-md"
              >
                {{ cart.totalQuantity }}
              </div>
              <span class="text-sm font-semibold">
                မှာယူရန် ရွေးထားသော Items
              </span>
            </div>

            <div class="flex items-center gap-1 font-bold text-sm">
              <span>{{ formatPrice(cart.subtotal) }} MMK</span>
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
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </div>
          </button>
        </div>
      </transition>
    </Teleport>
  </div>
</template>