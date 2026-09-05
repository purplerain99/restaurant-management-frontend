<script setup>
import { computed, onMounted, ref } from "vue";

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/services/categories";

const categories = ref([]);
const loading = ref(false);
const saving = ref(false);
const deletingId = ref(null);
const showModal = ref(false);
const editingCategory = ref(null);
const search = ref("");
const selectedActive = ref("");
const errorMessage = ref("");
const successMessage = ref("");
const validationErrors = ref({});

const form = ref({
  name: "",
  slug: "",
  is_active: true,
});

const modalTitle = computed(() =>
  editingCategory.value ? "Category ပြင်ဆင်မည်" : "Category အသစ်ထည့်မည်"
);

const resetForm = () => {
  form.value = {
    name: "",
    slug: "",
    is_active: true,
  };
  editingCategory.value = null;
  validationErrors.value = {};
};

const openCreate = () => {
  resetForm();
  showModal.value = true;
};

const openEdit = (category) => {
  editingCategory.value = category;
  form.value = {
    name: category.name,
    slug: category.slug,
    is_active: category.is_active,
  };
  validationErrors.value = {};
  showModal.value = true;
};

const closeModal = () => {
  if (saving.value) return;
  showModal.value = false;
  resetForm();
};

const loadCategories = async () => {
  loading.value = true;
  errorMessage.value = "";
  try {
    const response = await getCategories({
      search: search.value || undefined,
      is_active: selectedActive.value !== "" ? selectedActive.value : undefined,
    });
    categories.value = response.data?.items ?? response.data?.data ?? [];
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Category များ ရယူ၍မရပါ။";
  } finally {
    loading.value = false;
  }
};

const saveCategory = async () => {
  saving.value = true;
  errorMessage.value = "";
  successMessage.value = "";
  validationErrors.value = {};

  try {
    const payload = {
      name: form.value.name,
      slug: form.value.slug,
      is_active: form.value.is_active,
    };

    if (editingCategory.value) {
      await updateCategory(editingCategory.value.id, payload);
      successMessage.value = "Category ပြင်ဆင်ပြီးပါပြီ။";
    } else {
      await createCategory(payload);
      successMessage.value = "Category ဖန်တီးပြီးပါပြီ။";
    }

    closeModal();
    await loadCategories();
  } catch (error) {
    validationErrors.value = error.response?.data?.errors || {};
    errorMessage.value =
      error.response?.data?.message || "Category သိမ်း၍မရပါ။";
  } finally {
    saving.value = false;
  }
};

const removeCategory = async (category) => {
  const confirmed = window.confirm(`${category.name} ကို ဖျက်မှာသေချာပါသလား?`);
  if (!confirmed) return;

  deletingId.value = category.id;
  errorMessage.value = "";

  try {
    await deleteCategory(category.id);
    successMessage.value = "Category ဖျက်ပြီးပါပြီ။";
    await loadCategories();
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Category ဖျက်၍မရပါ။";
  } finally {
    deletingId.value = null;
  }
};

onMounted(loadCategories);
</script>

<template>
  <div class="space-y-6 max-w-screen-2xl mx-auto">
    <!-- Header -->
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1
          class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
        >
          Categories
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Menu Category များကို လွယ်ကူစွာ စီမံခန့်ခွဲပါ။
        </p>
      </div>

      <button
        type="button"
        @click="openCreate"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-all duration-200 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-95"
      >
        <svg
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        Category ထည့်မည်
      </button>
    </div>

    <!-- Alerts -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 -translate-y-2"
      enter-to-class="transform opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 translate-y-0"
      leave-to-class="transform opacity-0 -translate-y-2"
    >
      <div
        v-if="successMessage"
        class="flex items-center gap-3 rounded-xl border border-emerald-200/60 bg-emerald-50/80 p-4 text-sm text-emerald-800 shadow-sm backdrop-blur-sm"
      >
        <svg
          class="h-5 w-5 text-emerald-600 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{{ successMessage }}</span>
      </div>
    </transition>

    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 -translate-y-2"
      enter-to-class="transform opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 translate-y-0"
      leave-to-class="transform opacity-0 -translate-y-2"
    >
      <div
        v-if="errorMessage"
        class="flex items-center gap-3 rounded-xl border border-rose-200/60 bg-rose-50/80 p-4 text-sm text-rose-800 shadow-sm backdrop-blur-sm"
      >
        <svg
          class="h-5 w-5 text-rose-600 shrink-0"
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
        <span>{{ errorMessage }}</span>
      </div>
    </transition>

    <!-- Filters -->
    <div
      class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-100"
    >
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <input
            v-model="search"
            @keyup.enter="loadCategories"
            type="search"
            placeholder="Category ရှာမည်..."
            class="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-slate-800 transition duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <select
          v-model="selectedActive"
          @change="loadCategories"
          class="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 transition duration-200 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
        >
          <option value="">Status အားလုံး</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
      </div>
    </div>

    <!-- Table Container -->
    <div
      class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-100"
    >
      <!-- Loading State -->
      <div v-if="loading" class="p-12 text-center">
        <div class="inline-flex items-center gap-3 text-slate-500">
          <svg
            class="h-5 w-5 animate-spin text-indigo-600"
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
          <span class="text-sm font-medium">Category များကို ဖတ်နေသည်...</span>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!categories.length" class="p-12 text-center">
        <div
          class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl"
        >
          🗂️
        </div>
        <h3 class="mt-4 text-base font-semibold text-slate-900">
          Category မရှိသေးပါ။
        </h3>
        <p class="mt-1 text-sm text-slate-500">
          Category အသစ်တစ်ခု စတင်ထည့်သွင်းပါ။
        </p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100">
          <thead>
            <tr
              class="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
              <th scope="col" class="px-6 py-4">Category</th>
              <th scope="col" class="px-6 py-4">Slug</th>
              <th scope="col" class="px-6 py-4">Menu Items</th>
              <th scope="col" class="px-6 py-4">Status</th>
              <th scope="col" class="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr
              v-for="category in categories"
              :key="category.id"
              class="transition duration-150 hover:bg-slate-50/50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <p class="font-semibold text-slate-900 text-sm">
                  {{ category.name }}
                </p>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600"
                >
                  {{ category.slug }}
                </span>
              </td>

              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                <span class="inline-flex items-center gap-1.5 font-medium">
                  {{ category.menu_items_count ?? 0 }} items
                </span>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                  :class="
                    category.is_active
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                      : 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10'
                  "
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full"
                    :class="
                      category.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                    "
                  ></span>
                  {{ category.is_active ? "Active" : "Inactive" }}
                </span>
              </td>

              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    @click="openEdit(category)"
                    class="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    :disabled="deletingId === category.id"
                    @click="removeCategory(category)"
                    class="rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 active:scale-95"
                  >
                    {{ deletingId === category.id ? "Deleting..." : "Delete" }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
        >
          <div
            class="w-full max-w-md rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/5 overflow-hidden"
          >
            <!-- Modal Header -->
            <div
              class="flex items-center justify-between border-b border-slate-100 px-6 py-4"
            >
              <h2 class="text-base font-bold text-slate-900">
                {{ modalTitle }}
              </h2>

              <button
                type="button"
                @click="closeModal"
                class="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <!-- Modal Form -->
            <form @submit.prevent="saveCategory" class="space-y-4 p-6">
              <div>
                <label
                  class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600"
                >
                  Category Name
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="ဥပမာ - မြန်မာအစားအစာ"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 transition duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
                <p
                  v-if="validationErrors.name"
                  class="mt-1 text-xs text-rose-600"
                >
                  {{ validationErrors.name[0] }}
                </p>
              </div>

              <div>
                <label
                  class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600"
                >
                  Slug
                </label>
                <input
                  v-model="form.slug"
                  type="text"
                  required
                  placeholder="myanmar-food"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-mono text-slate-800 transition duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
                <p
                  v-if="validationErrors.slug"
                  class="mt-1 text-xs text-rose-600"
                >
                  {{ validationErrors.slug[0] }}
                </p>
              </div>

              <div class="pt-2">
                <label
                  class="flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 cursor-pointer"
                >
                  <div>
                    <p class="text-sm font-semibold text-slate-900">
                      Active Status
                    </p>
                    <p class="text-xs text-slate-500">
                      Customer menu များတွင် ပြသမည်
                    </p>
                  </div>
                  <input
                    v-model="form.is_active"
                    type="checkbox"
                    class="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              </div>

              <!-- Modal Actions -->
              <div
                class="flex items-center justify-end gap-3 border-t border-slate-100 pt-5 mt-6"
              >
                <button
                  type="button"
                  @click="closeModal"
                  class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-95"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  :disabled="saving"
                  class="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-all hover:bg-indigo-500 disabled:opacity-50 active:scale-95"
                >
                  <svg
                    v-if="saving"
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
                  <span>{{ saving ? "သိမ်းနေသည်..." : "သိမ်းမည်" }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>