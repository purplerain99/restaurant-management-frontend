<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import { useCartStore } from "@/stores/cart";
import { imageUrl } from "@/stores/url";

const router = useRouter();
const cart = useCartStore();

const orderNote = ref("");
const ordering = ref(false);
const errorMessage = ref("");
const guestName = ref("");
const guestPhone = ref("");

const formatPrice = (value) => {
  return Number(value).toLocaleString();
};

const goToMenu = () => {
  console.log("clicked");

  router.push({
    name: "customer.menu",
    params: {
      table_code: cart.tableCode,
    },
  });
};

const placeOrder = async () => {
  if (!cart.items.length) {
    return;
  }

  ordering.value = true;
  errorMessage.value = "";

  try {
    const response = await cart.checkout({
      guest_name: guestName.value || null,
      guest_phone: guestPhone.value || null,
      note: orderNote.value || null,
    });

    console.log("ORDER RESPONSE:", response);

    /*
    |--------------------------------------------------------------------------
    | Backend response
    |--------------------------------------------------------------------------
    | {
    |   success: true,
    |   message: "...",
    |   data: {
    |     order_number: "...",
    |     tracking_token: "..."
    |   }
    | }
    |--------------------------------------------------------------------------
    */
    const order = response.data;
    console.log(order, "order responsive error");

    if (!order) {
      throw new Error("Order information မရရှိပါ။");
    }

    if (!order.order_number || !order.tracking_token) {
      throw new Error("Order tracking information မရရှိပါ။");
    }

    /*
    |--------------------------------------------------------------------------
    | Go to Order Tracking
    |--------------------------------------------------------------------------
    */
    await router.replace({
      name: "customer.order-success",
      params: {
        order_number: order.order_number,
        tracking_token: order.tracking_token,
      },
    });
  } catch (error) {
    console.error("ORDER ERROR:", error);

    errorMessage.value =
      error.response?.data?.message || error.message || "Order တင်၍မရပါ။";
  } finally {
    ordering.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 pb-12">
    <!-- Header -->
    <header
      class="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md"
    >
      <div
        class="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6"
      >
        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="goToMenu"
            class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-700 shadow-sm transition duration-200 hover:bg-slate-50 active:scale-95"
            aria-label="Go back to menu"
          >
            <svg
              class="h-5 w-5"
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
          </button>

          <div>
            <h1 class="text-lg font-bold text-slate-900">Your Cart</h1>
            <p class="text-xs font-medium text-slate-500">
              {{ cart.totalQuantity }} items selected
            </p>
          </div>
        </div>

        <span
          v-if="cart.tableCode"
          class="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100"
        >
          <span class="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
          Table: {{ cart.tableCode }}
        </span>
      </div>
    </header>

    <main class="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
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
            <p class="font-bold">Checkout Error</p>
            <p class="mt-0.5 text-xs text-rose-700">{{ errorMessage }}</p>
          </div>
        </div>
      </transition>

      <!-- Empty Cart -->
      <div
        v-if="cart.items.length === 0"
        class="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm"
      >
        <div
          class="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-4xl"
        >
          🛒
        </div>
        <h2 class="mt-4 text-lg font-bold text-slate-900">
          Cart ထဲမှာ ဘာမှမရှိသေးပါ။
        </h2>
        <p class="mt-1 text-xs text-slate-500">
          အရသာရှိသော အစားအသောက်များကို ရွေးချယ်ရန် Menu သို့ သွားပါ။
        </p>

        <button
          type="button"
          @click="goToMenu"
          class="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-200 transition duration-200 hover:bg-indigo-500 active:scale-95"
        >
          Menu သို့ပြန်မည်
        </button>
      </div>

      <template v-else>
        <!-- Cart Items Section -->
        <section class="space-y-4">
          <h2
            class="text-sm font-bold tracking-wider text-slate-400 uppercase px-1"
          >
            Selected Items ({{ cart.items.length }})
          </h2>

          <div class="space-y-3">
            <div
              v-for="item in cart.items"
              :key="item.id"
              class="group rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-200 hover:border-slate-300"
            >
              <div class="flex gap-4">
                <!-- Thumbnail -->
                <div
                  class="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100"
                >
                  <img
                    v-if="item.image"
                    :src="item.image"
                    :alt="item.name"
                    class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div
                    v-else
                    class="flex h-full items-center justify-center text-2xl text-slate-300"
                  >
                    🍽️
                  </div>
                </div>

                <!-- Info & Quantity -->
                <div class="min-w-0 flex-1 flex flex-col justify-between">
                  <div class="flex items-start justify-between gap-2">
                    <h3 class="font-bold text-slate-900 line-clamp-1">
                      {{ item.name }}
                    </h3>

                    <button
                      type="button"
                      @click="cart.removeItem(item.id)"
                      class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-rose-500 transition hover:bg-rose-50 hover:text-rose-600"
                      title="Remove item"
                    >
                      <svg
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>

                  <p class="text-xs font-semibold text-slate-500">
                    {{ formatPrice(item.price) }} MMK
                  </p>

                  <div class="mt-3 flex items-center justify-between gap-2">
                    <!-- Quantity Selector -->
                    <div
                      class="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50/50 p-1"
                    >
                      <button
                        type="button"
                        @click="cart.decreaseQuantity(item.id)"
                        class="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 active:scale-95"
                      >
                        <svg
                          class="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="3"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M19.5 12h-15"
                          />
                        </svg>
                      </button>

                      <span
                        class="min-w-8 text-center text-xs font-bold text-slate-800"
                      >
                        {{ item.quantity }}
                      </span>

                      <button
                        type="button"
                        @click="cart.increaseQuantity(item.id)"
                        class="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 active:scale-95"
                      >
                        <svg
                          class="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="3"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 4.5v15m7.5-7.5h-15"
                          />
                        </svg>
                      </button>
                    </div>

                    <!-- Total Price per Item -->
                    <p class="font-black text-slate-900 text-sm">
                      {{ formatPrice(item.price * item.quantity) }}
                      <span class="text-xs font-bold text-indigo-600">MMK</span>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Special Note Input -->
              <div class="mt-3.5 pt-3 border-t border-slate-100">
                <input
                  v-model="item.special_note"
                  type="text"
                  placeholder="Special note (ဥပမာ - spicy မထည့်ပါ)"
                  class="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/10"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- Guest Form -->
        <section
          class="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4"
        >
          <div class="flex items-center justify-between">
            <h2 class="font-bold text-slate-900 flex items-center gap-2">
              <span>👤</span> Guest Information
            </h2>
            <span
              class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500"
            >
              Optional
            </span>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-xs font-semibold text-slate-700">
                Guest Name
              </label>
              <input
                v-model="guestName"
                type="text"
                maxlength="100"
                placeholder="ဥပမာ - Ko Aung"
                class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10"
              />
            </div>

            <div>
              <label class="mb-1.5 block text-xs font-semibold text-slate-700">
                Phone Number
              </label>
              <input
                v-model="guestPhone"
                type="tel"
                maxlength="30"
                placeholder="09xxxxxxxxx"
                class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10"
              />
            </div>
          </div>
        </section>

        <!-- Order Note -->
        <section
          class="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3"
        >
          <h2 class="font-bold text-slate-900 flex items-center gap-2">
            <span>📝</span> Order Note
          </h2>

          <textarea
            v-model="orderNote"
            rows="2"
            placeholder="စားသောက်ဆိုင်သို့ မှာကြားလိုသည့် အချက်များ..."
            class="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10"
          ></textarea>
        </section>

        <!-- Summary & Action -->
        <section
          class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5"
        >
          <h2 class="font-bold text-slate-900 border-b border-slate-100 pb-3">
            Payment Summary
          </h2>

          <div class="space-y-3 text-sm">
            <div class="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span class="font-semibold text-slate-900">
                {{ formatPrice(cart.subtotal) }} MMK
              </span>
            </div>

            <div
              class="border-t border-slate-100 pt-3 flex justify-between items-baseline"
            >
              <span class="font-bold text-slate-900">Total Amount</span>
              <div class="text-right">
                <span class="text-2xl font-black text-indigo-600">
                  {{ formatPrice(cart.subtotal) }}
                </span>
                <span class="ml-1 text-xs font-bold text-indigo-600">MMK</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            @click="placeOrder"
            :disabled="ordering"
            class="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-all duration-200 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <svg
              v-if="ordering"
              class="h-5 w-5 animate-spin text-white"
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
            <span>{{
              ordering ? "Order တင်နေသည်..." : "Order အတည်ပြုမည်"
            }}</span>
          </button>
        </section>
      </template>
    </main>
  </div>
</template>