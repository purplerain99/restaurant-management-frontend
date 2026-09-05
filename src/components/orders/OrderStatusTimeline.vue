<script setup>
import { computed } from "vue";

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
});

const steps = [
  {
    value: "pending",
    label: "Order Received",
    mm: "Order လက်ခံရရှိပါပြီ",
  },

  {
    value: "confirmed",
    label: "Confirmed",
    mm: "Order အတည်ပြုပြီးပါပြီ",
  },

  {
    value: "preparing",
    label: "Preparing",
    mm: "အစားအစာ ပြင်ဆင်နေပါသည်",
  },

  {
    value: "ready",
    label: "Ready",
    mm: "အစားအစာ အသင့်ဖြစ်ပါပြီ",
  },

  {
    value: "served",
    label: "Served",
    mm: "စားပွဲသို့ ပို့ပြီးပါပြီ",
  },

  {
    value: "completed",
    label: "Completed",
    mm: "Order ပြီးဆုံးပါပြီ",
  },
];

const currentIndex = computed(() => {
  return steps.findIndex((step) => step.value === props.status);
});

const isDone = (index) => {
  return index < currentIndex.value;
};

const isCurrent = (index) => {
  return index === currentIndex.value;
};

const isCancelled = computed(() => props.status === "cancelled");
</script>


<template>
  <div class="space-y-5">
    <div
      v-if="isCancelled"
      class="rounded-xl bg-red-50 p-4 text-sm text-red-700"
    >
      ဒီ Order ကို ပယ်ဖျက်ထားပါသည်။
    </div>

    <div
      v-for="(step, index) in steps"
      :key="step.value"
      class="relative flex gap-4"
    >
      <div class="relative flex w-8 justify-center">
        <div
          class="z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
          :class="[
            isDone(index)
              ? 'bg-emerald-600 text-white'
              : isCurrent(index)
              ? 'bg-slate-900 text-white'
              : 'bg-slate-200 text-slate-500',
          ]"
        >
          {{ isDone(index) ? "✓" : index + 1 }}
        </div>

        <div
          v-if="index < steps.length - 1"
          class="absolute top-8 -b-20 w-px"
          :class="isDone(index) ? 'bg-emerald-500' : 'bg-slate-200'"
        />
      </div>

      <div class="pb-5">
        <p
          class="font-semibold"
          :class="isCurrent(index) ? 'text-slate-900' : 'text-slate-700'"
        >
          {{ step.label }}
        </p>

        <p class="mt-0.5 text-sm text-slate-500">
          {{ step.mm }}
        </p>
      </div>
    </div>
  </div>
</template>