<script setup>
import { onMounted, ref } from "vue";

import { getCategories } from "@/services/categories";

import {
  createMenuItem,
  deleteMenuItem,
  getMenuItems,
  updateMenuItem,
} from "@/services/menu";

const menuItems = ref([]);
const categories = ref([]);
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const showModal = ref(false);
const editingItem = ref(null);
const imagePreview = ref(null);
const imageFile = ref(null);

const form = ref({
  category_id: "",
  name: "",
  slug: "",
  description: "",
  price: "",
  is_available: true,
});

const resetForm = () => {
  form.value = {
    category_id: "",
    name: "",
    slug: "",
    description: "",
    price: "",
    is_available: true,
  };
  imageFile.value = null;
  imagePreview.value = null;
  editingItem.value = null;
};

const openCreate = () => {
  resetForm();
  showModal.value = true;
};

const openEdit = (item) => {
  editingItem.value = item;
  form.value = {
    category_id: item.category_id,
    name: item.name,
    slug: item.slug,
    description: item.description || "",
    price: item.price,
    is_available: item.is_available,
  };
  imageFile.value = null;
  imagePreview.value = item.image || null;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  if (saving.value) return;

  resetForm();
};

const handleImageChange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    errorMessage.value = "JPG, PNG, WEBP image ကိုသာ အသုံးပြုပါ။";
    event.target.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = "Image size သည် 5MB ထက် မပိုရပါ။";
    event.target.value = "";
    return;
  }

  imageFile.value = file;
  imagePreview.value = URL.createObjectURL(file);
};

const buildFormData = (isUpdate = false) => {
  const data = new FormData();
  data.append("category_id", String(form.value.category_id));
  data.append("name", form.value.name);
  data.append("slug", form.value.slug);
  data.append("description", form.value.description || "");
  data.append("price", String(form.value.price));
  data.append("is_available", form.value.is_available ? "1" : "0");

  if (imageFile.value instanceof File) {
    data.append("image", imageFile.value, imageFile.value.name);
  }

  // Handle Laravel multipart PUT workaround
  // if (isUpdate) {
  //   data.append("_method", "PUT");
  // }

  return data;
};

// Search and Load Data
const search = ref("");
const selectedCategory = ref("");
const selectedAvailability = ref("");
const currentPage = ref(1);
const lastPage = ref(1);
const totalItems = ref(0);

const loadData = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const [categoryResponse, menuResponse] = await Promise.all([
      getCategories(),
      getMenuItems({
        page: currentPage.value,
        per_page: 12,
        search: search.value || undefined,
        category_id: selectedCategory.value || undefined,
        is_available:
          selectedAvailability.value !== ""
            ? selectedAvailability.value
            : undefined,
      }),
    ]);

    categories.value = categoryResponse.data?.items ?? [];
    menuItems.value = menuResponse.data?.items ?? [];

    const pagination = menuResponse.data?.pagination;
    if (pagination) {
      currentPage.value = pagination.current_page;
      lastPage.value = pagination.last_page;
      totalItems.value = pagination.total;
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Menu များ ရယူ၍မရပါ။";
  } finally {
    loading.value = false;
  }
};

const goToPage = async (page) => {
  if (page < 1 || page > lastPage.value) return;
  currentPage.value = page;
  await loadData();
};

const previousPage = () => goToPage(currentPage.value - 1);
const nextPage = () => goToPage(currentPage.value + 1);

const searchMenu = async () => {
  currentPage.value = 1;
  await loadData();
};

const onCategoryChange = async () => {
  currentPage.value = 1;
  await loadData();
};

const onAvailabilityChange = async () => {
  currentPage.value = 1;
  await loadData();
};

const saveMenuItem = async () => {
  saving.value = true;
  errorMessage.value = "";

  try {
    if (editingItem.value) {
      const formData = buildFormData(true);
      // Send POST with _method="PUT" if backend expects standard Laravel multipart parsing
      await updateMenuItem(editingItem.value.id, formData);
      successMessage.value = "Menu Item ပြင်ဆင်ပြီးပါပြီ။";
    } else {
      const formData = buildFormData(false);
      await createMenuItem(formData);
      await loadData();
      successMessage.value = "Menu Item ဖန်တီးပြီးပါပြီ။";
    }

    // Modal closes automatically here only when request succeeds
    closeModal();
    await loadData();
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Menu Item သိမ်း၍မရပါ။";
  } finally {
    saving.value = false;
  }
};

const removeItem = async (item) => {
  const confirmed = window.confirm(`${item.name} ကို ဖျက်မှာသေချာပါသလား?`);
  if (!confirmed) return;

  try {
    await deleteMenuItem(item.id);
    successMessage.value = "Menu Item ဖျက်ပြီးပါပြီ။";
    await loadData();
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Menu Item ဖျက်၍မရပါ။";
  }
};

const statusText = (item) => (item.is_available ? "ရနိုင်သည်" : "မရနိုင်ပါ");
const formatPrice = (value) => Number(value).toLocaleString();

onMounted(loadData);
</script>

<template>
  <div class="space-y-6 p-2 sm:p-4">
    <!-- Header -->
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1
          class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
        >
          Menu Items
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Menu များနှင့် အစားအစာပုံများကို စီမံခန့်ခွဲပါ။
        </p>
      </div>

      <button
        type="button"
        @click="openCreate"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition duration-200 hover:bg-indigo-700 active:scale-95"
      >
        <svg
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Menu Item ထည့်မည်
      </button>
    </div>

    <!-- Alert Messages -->
    <div
      v-if="successMessage"
      class="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3.5 text-sm font-medium text-emerald-800 shadow-sm backdrop-blur-sm"
    >
      <span
        class="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-200 text-emerald-700"
        >✓</span
      >
      {{ successMessage }}
    </div>

    <div
      v-if="errorMessage"
      class="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3.5 text-sm font-medium text-rose-800 shadow-sm backdrop-blur-sm"
    >
      <span
        class="flex h-6 w-6 items-center justify-center rounded-full bg-rose-200 text-rose-700"
        >✕</span
      >
      {{ errorMessage }}
    </div>

    <!-- Filters -->
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <!-- Search Input -->
      <div class="relative">
        <input
          v-model="search"
          @keyup.enter="searchMenu"
          type="search"
          placeholder="Menu ရှာမည်..."
          class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-20 text-sm text-slate-800 placeholder-slate-400 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        <button
          type="button"
          @click="searchMenu"
          class="absolute right-1.5 top-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
        >
          ရှာမည်
        </button>
      </div>

      <!-- Category Filter -->
      <select
        v-model="selectedCategory"
        @change="onCategoryChange"
        class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      >
        <option value="">Category အားလုံး</option>
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.name }}
        </option>
      </select>

      <!-- Availability Filter -->
      <select
        v-model="selectedAvailability"
        @change="onAvailabilityChange"
        class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      >
        <option value="">Availability အားလုံး</option>
        <option value="1">Available</option>
        <option value="0">Unavailable</option>
      </select>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-16 shadow-sm"
    >
      <div
        class="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"
      ></div>
      <p class="mt-4 text-sm font-medium text-slate-500">
        Menu များကို ဖတ်နေသည်...
      </p>
    </div>

    <!-- Desktop Table -->
    <div
      v-else
      class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead
            class="bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            <tr>
              <th scope="col" class="px-6 py-4">Image</th>
              <th scope="col" class="px-6 py-4">Menu</th>
              <th scope="col" class="px-6 py-4">Category</th>
              <th scope="col" class="px-6 py-4">Price</th>
              <th scope="col" class="px-6 py-4">Status</th>
              <th scope="col" class="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100 font-normal text-slate-700">
            <tr
              v-for="item in menuItems"
              :key="item.id"
              class="transition hover:bg-slate-50/80"
            >
              <!-- Image -->
              <td class="whitespace-nowrap px-6 py-3.5">
                <div
                  class="h-14 w-14 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 shadow-inner"
                >
                  <img
                    v-if="item.image"
                    :src="item.image"
                    :alt="item.name"
                    class="h-full w-full object-cover transition duration-300 hover:scale-105"
                  />
                  <div
                    v-else
                    class="flex h-full items-center justify-center text-xl opacity-60"
                  >
                    🍽️
                  </div>
                </div>
              </td>

              <!-- Name & Slug -->
              <td class="px-6 py-3.5">
                <p class="font-semibold text-slate-900">{{ item.name }}</p>
                <p class="text-xs text-slate-400 font-mono mt-0.5">
                  {{ item.slug }}
                </p>
              </td>

              <!-- Category -->
              <td class="whitespace-nowrap px-6 py-3.5">
                <span
                  class="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                >
                  {{ item.category?.name || "-" }}
                </span>
              </td>

              <!-- Price -->
              <td
                class="whitespace-nowrap px-6 py-3.5 font-semibold text-slate-900"
              >
                {{ formatPrice(item.price) }}
                <span class="text-xs font-normal text-slate-500">MMK</span>
              </td>

              <!-- Status -->
              <td class="whitespace-nowrap px-6 py-3.5">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                  :class="
                    item.is_available
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                      : 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20'
                  "
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full"
                    :class="
                      item.is_available ? 'bg-emerald-500' : 'bg-rose-500'
                    "
                  ></span>
                  {{ statusText(item) }}
                </span>
              </td>

              <!-- Actions -->
              <td class="whitespace-nowrap px-6 py-3.5 text-right">
                <div class="flex justify-end gap-2">
                  <button
                    type="button"
                    @click="openEdit(item)"
                    class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    @click="removeItem(item)"
                    class="rounded-lg border border-transparent bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="menuItems.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                Menu Item မရှိသေးပါ။
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div
          v-if="lastPage > 1"
          class="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3.5"
        >
          <p class="text-xs text-slate-500">
            စုစုပေါင်း
            <span class="font-semibold text-slate-700">{{ totalItems }}</span>
            ခု
          </p>

          <div class="flex items-center gap-1.5">
            <button
              type="button"
              :disabled="currentPage === 1"
              @click="previousPage"
              class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>

            <span class="px-3 py-1 text-xs font-semibold text-slate-700">
              {{ currentPage }} / {{ lastPage }}
            </span>

            <button
              type="button"
              :disabled="currentPage === lastPage"
              @click="nextPage"
              class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs transition-opacity"
    >
      <div
        class="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all"
      >
        <!-- Modal Header -->
        <div
          class="flex items-center justify-between border-b border-slate-100 px-6 py-4"
        >
          <div>
            <h2 class="text-lg font-bold text-slate-900">
              {{ editingItem ? "Menu ပြင်ဆင်မည်" : "Menu အသစ်ထည့်မည်" }}
            </h2>
            <p class="text-xs text-slate-500">
              လိုအပ်သော အချက်အလက်များကို ဖြည့်သွင်းပါ။
            </p>
          </div>

          <button
            type="button"
            @click="closeModal"
            class="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <!-- Form Elements -->
        <form
          @submit.prevent="saveMenuItem"
          class="max-h-[80vh] overflow-y-auto p-6 space-y-4"
        >
          <!-- Image Upload Preview -->
          <div>
            <label class="mb-1.5 block text-xs font-semibold text-slate-700"
              >Menu Image</label
            >
            <div
              class="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 transition hover:bg-slate-50"
            >
              <template v-if="imagePreview">
                <div class="relative h-44 w-full overflow-hidden rounded-xl">
                  <img
                    :src="imagePreview"
                    :alt="form.name"
                    class="h-full w-full object-cover"
                  />
                  <label
                    class="absolute bottom-2 right-2 cursor-pointer rounded-lg bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-slate-900"
                  >
                    Change Image
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      class="hidden"
                      @change="handleImageChange"
                    />
                  </label>
                </div>
              </template>

              <template v-else>
                <label
                  class="flex flex-col items-center justify-center cursor-pointer py-4"
                >
                  <div class="rounded-full bg-indigo-50 p-3 text-indigo-600">
                    🖼️
                  </div>
                  <p class="mt-2 text-xs font-semibold text-slate-700">
                    Image ရွေးချယ်ရန် နှိပ်ပါ
                  </p>
                  <p class="mt-0.5 text-[10px] text-slate-400">
                    JPG, PNG, WEBP (Max 5MB)
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    class="hidden"
                    @change="handleImageChange"
                  />
                </label>
              </template>
            </div>
          </div>

          <!-- Category -->
          <div>
            <label class="mb-1.5 block text-xs font-semibold text-slate-700"
              >Category</label
            >
            <select
              v-model="form.category_id"
              required
              class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="" disabled>Category ရွေးပါ</option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Name and Slug Grid -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-xs font-semibold text-slate-700"
                >Menu Name</label
              >
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="Chicken Fried Rice"
                class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label class="mb-1.5 block text-xs font-semibold text-slate-700"
                >Slug</label
              >
              <input
                v-model="form.slug"
                type="text"
                required
                placeholder="chicken-fried-rice"
                class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <!-- Price -->
          <div>
            <label class="mb-1.5 block text-xs font-semibold text-slate-700"
              >Price (MMK)</label
            >
            <input
              v-model.number="form.price"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="5000"
              class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="mb-1.5 block text-xs font-semibold text-slate-700"
              >Description</label
            >
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Menu အကြောင်း အသေးစိတ်..."
              class="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <!-- Availability Switch Box -->
          <label
            class="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-3.5 transition hover:bg-slate-50"
          >
            <div>
              <p class="text-xs font-semibold text-slate-800">
                Menu Availability
              </p>
              <p class="text-[11px] text-slate-500">
                ဝယ်ယူသူများ မှာယူနိုင်အောင် ပြသမည်
              </p>
            </div>
            <input
              v-model="form.is_available"
              type="checkbox"
              class="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
          </label>

          <!-- Buttons -->
          <div
            class="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4"
          >
            <button
              type="button"
              @click="closeModal"
              class="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {{ saving ? "သိမ်းနေသည်..." : "သိမ်းမည်" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>