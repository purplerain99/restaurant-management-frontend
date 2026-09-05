<script setup>
import { computed, onMounted, ref } from "vue";

import {
  createTable,
  deleteTable,
  getTableQr,
  getTables,
  updateTable,
} from "@/services/tables";

const tables = ref([]);
const loading = ref(false);
const saving = ref(false);

const showModal = ref(false);
const showQrModal = ref(false);

const editingTable = ref(null);
const qrTable = ref(null);
const qrUrl = ref("");

const errorMessage = ref("");

const form = ref({
  name: "",
  capacity: 4,
  status: "available",
});

const statusOptions = [
  { value: "available", label: "Available" },
  { value: "occupied", label: "Occupied" },
  { value: "reserved", label: "Reserved" },
  { value: "inactive", label: "Inactive" },
];

const pageTitle = computed(() =>
  editingTable.value ? "စားပွဲပြင်မည်" : "စားပွဲအသစ်ထည့်မည်"
);

const loadTables = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await getTables();
    tables.value = response.data.data ?? [];
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "စားပွဲများကို ရယူ၍မရပါ။";
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  editingTable.value = null;
  form.value = {
    name: "",
    capacity: 4,
    status: "available",
  };
  errorMessage.value = "";
  showModal.value = true;
};

const openEditModal = (table) => {
  editingTable.value = table;
  form.value = {
    name: table.name,
    capacity: table.capacity,
    status: table.status,
  };
  errorMessage.value = "";
  showModal.value = true;
};

const closeModal = () => {
  if (saving.value) return;
  showModal.value = false;
};

const saveTable = async () => {
  saving.value = true;
  errorMessage.value = "";

  try {
    if (editingTable.value) {
      await updateTable(editingTable.value.id, form.value);
    } else {
      await createTable(form.value);
    }
    showModal.value = false;
    await loadTables();
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "သိမ်းဆည်း၍ မရပါ။";
  } finally {
    saving.value = false;
  }
};

const removeTable = async (table) => {
  const confirmed = window.confirm(`${table.name} ကို ဖျက်မှာသေချာပါသလား?`);
  if (!confirmed) return;

  try {
    await deleteTable(table.id);
    await loadTables();
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "စားပွဲဖျက်၍မရပါ။";
  }
};

const showQr = async (table) => {
  qrTable.value = table;
  const blob = await getTableQr(table.id);
  qrUrl.value = URL.createObjectURL(blob);
  showQrModal.value = true;
};

const closeQr = () => {
  showQrModal.value = false;
  if (qrUrl.value) {
    URL.revokeObjectURL(qrUrl.value);
  }
  qrUrl.value = "";
  qrTable.value = null;
};

const downloadQr = () => {
  if (!qrUrl.value || !qrTable.value) return;

  const link = document.createElement("a");
  link.href = qrUrl.value;
  link.download = `${qrTable.value.table_code}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const printQr = () => {
  if (!qrUrl.value || !qrTable.value) return;

  const printWindow = window.open("", "_blank", "width=600,height=700");
  if (!printWindow) return;

  printWindow.document.write(`
        <!doctype html>
        <html>
        <head>
            <title>${qrTable.value.name} QR Code</title>
            <style>
                body {
                    font-family: system-ui, -apple-system, sans-serif;
                    text-align: center;
                    padding: 40px;
                }
                img {
                    width: 320px;
                    max-width: 90%;
                    margin: 20px 0;
                }
                h1 {
                    font-size: 24px;
                    margin-bottom: 4px;
                    color: #0f172a;
                }
                p {
                    color: #64748b;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <h1>${qrTable.value.name}</h1>
            <p>${qrTable.value.table_code}</p>
            <img src="${qrUrl.value}" alt="QR Code" />
            <script>
                window.onload = function () {
                    window.print();
                };
            <\/script>
        </body>
        </html>
    `);
  printWindow.document.close();
};

onMounted(() => {
  loadTables();
});
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
          စားပွဲများ
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Restaurant စားပွဲများနှင့် QR Code များကို စီမံခန့်ခွဲနိုင်ပါသည်။
        </p>
      </div>

      <button
        type="button"
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-orange-500 active:scale-95"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span>စားပွဲထည့်မည်</span>
      </button>
    </div>

    <!-- Error Alert -->
    <div
      v-if="errorMessage"
      class="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm"
    >
      <svg
        class="h-5 w-5 shrink-0 text-red-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Loading Skeleton Grid -->
    <div v-if="loading" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="i in 6"
        :key="i"
        class="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4"
      >
        <div class="flex justify-between items-start">
          <div class="space-y-2">
            <div class="h-5 w-28 bg-slate-200 rounded-md"></div>
            <div class="h-3 w-16 bg-slate-100 rounded-md"></div>
          </div>
          <div class="h-6 w-20 bg-slate-200 rounded-full"></div>
        </div>
        <div class="h-4 w-24 bg-slate-100 rounded-md"></div>
        <div class="h-10 w-full bg-slate-100 rounded-xl"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!tables.length"
      class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-sm"
    >
      <div
        class="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 text-3xl mb-4"
      >
        🍽️
      </div>
      <h3 class="text-lg font-bold text-slate-900">စားပွဲမရှိသေးပါ</h3>
      <p class="mt-1 text-sm text-slate-500 max-w-sm">
        Restaurant အတွက် ပထမဆုံး စားပွဲတစ်ခုကို စတင်ထည့်သွင်းပါ။
      </p>
      <button
        type="button"
        @click="openCreateModal"
        class="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:bg-orange-500 transition"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span>စားပွဲထည့်မည်</span>
      </button>
    </div>

    <!-- Table Grid -->
    <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="table in tables"
        :key="table.id"
        class="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300"
      >
        <!-- Table Details -->
        <div class="p-5">
          <div class="flex items-start justify-between gap-2">
            <div>
              <h3
                class="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors"
              >
                {{ table.name }}
              </h3>
              <p class="mt-0.5 font-mono text-xs font-semibold text-slate-400">
                {{ table.table_code }}
              </p>
            </div>

            <!-- Status Badges -->
            <span
              class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize"
              :class="{
                'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20':
                  table.status === 'available',
                'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20':
                  table.status === 'occupied',
                'bg-sky-50 text-sky-700 ring-1 ring-sky-600/20':
                  table.status === 'reserved',
                'bg-slate-100 text-slate-600 ring-1 ring-slate-500/20':
                  table.status === 'inactive',
              }"
            >
              <span
                class="h-1.5 w-1.5 rounded-full"
                :class="{
                  'bg-emerald-500': table.status === 'available',
                  'bg-amber-500': table.status === 'occupied',
                  'bg-sky-500': table.status === 'reserved',
                  'bg-slate-400': table.status === 'inactive',
                }"
              ></span>
              {{ table.status }}
            </span>
          </div>

          <div class="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <svg
              class="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span
              >Capacity:
              <strong class="font-bold text-slate-800">{{
                table.capacity
              }}</strong>
              ယောက်</span
            >
          </div>
        </div>

        <!-- Action Control Buttons -->
        <div class="grid grid-cols-3 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            @click="showQr(table)"
            class="flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
            <span>QR Code</span>
          </button>

          <button
            type="button"
            @click="openEditModal(table)"
            class="flex items-center justify-center gap-1.5 border-x border-slate-100 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-100/80 transition"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span>Edit</span>
          </button>

          <button
            type="button"
            @click="removeTable(table)"
            class="flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm transition-opacity"
    >
      <div
        class="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
      >
        <div
          class="flex items-center justify-between border-b border-slate-100 px-6 py-4"
        >
          <h2 class="text-base font-bold text-slate-900">
            {{ pageTitle }}
          </h2>
          <button
            @click="closeModal"
            class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveTable" class="space-y-4 p-6">
          <div>
            <label
              class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600"
            >
              စားပွဲအမည်
            </label>
            <input
              v-model="form.name"
              type="text"
              placeholder="e.g. Table 01"
              required
              class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div>
            <label
              class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600"
            >
              Capacity (ဆံ့ဝင်ဆံ့အား)
            </label>
            <input
              v-model.number="form.capacity"
              type="number"
              min="1"
              max="100"
              required
              class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div>
            <label
              class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600"
            >
              Status (အခြေအနေ)
            </label>
            <select
              v-model="form.status"
              class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-white"
            >
              <option
                v-for="status in statusOptions"
                :key="status.value"
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </select>
          </div>

          <div
            v-if="errorMessage"
            class="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600"
          >
            {{ errorMessage }}
          </div>

          <div class="mt-6 flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              @click="closeModal"
              class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              :disabled="saving"
              class="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:bg-orange-500 disabled:opacity-50 transition"
            >
              <svg
                v-if="saving"
                class="animate-spin h-4 w-4 text-white"
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

    <!-- QR Modal -->
    <div
      v-if="showQrModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm transition-opacity"
    >
      <div
        class="w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 shadow-2xl text-center"
      >
        <h2 class="text-xl font-bold text-slate-900">
          {{ qrTable?.name }}
        </h2>
        <p class="mt-0.5 font-mono text-xs font-semibold text-slate-400">
          {{ qrTable?.table_code }}
        </p>

        <div
          class="my-6 flex justify-center rounded-2xl bg-slate-50 p-6 border border-slate-100"
        >
          <img
            v-if="qrUrl"
            :src="qrUrl"
            alt="Table QR Code"
            class="h-60 w-60 object-contain drop-shadow-md"
          />
        </div>

        <div class="grid grid-cols-3 gap-2">
          <button
            type="button"
            @click="downloadQr"
            class="inline-flex items-center justify-center gap-1 rounded-xl bg-orange-600 px-3 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:bg-orange-500 transition"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>Download</span>
          </button>

          <button
            type="button"
            @click="printQr"
            class="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            <span>Print</span>
          </button>

          <button
            type="button"
            @click="closeQr"
            class="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>