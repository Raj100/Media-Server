<script setup lang="ts">
import { m } from "motion-v";

defineProps<{
  title: string;
  placeholder: string;
  modelValue: string;
  color: "blue" | "green";
  onDownload: () => void;
  delay?: number;
}>();

defineEmits(["update:modelValue"]);
</script>

<template>
  <m.div
    :initial="{ opacity: 0, x: color === 'blue' ? -20 : 20 }"
    :animate="{ opacity: 1, x: 0 }"
    :transition="{ delay: delay || 0, duration: 0.5 }"
    class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-5"
  >
    <input
      type="text"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      class="border p-3 rounded w-full focus:ring-2"
      :class="color === 'blue' ? 'focus:ring-blue-400' : 'focus:ring-green-400'"
    />
    <button
      @click="onDownload"
      class="text-white px-5 py-2 rounded-lg mt-3 transition duration-300"
      :class="color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'"
    >
      {{ title }}
    </button>
  </m.div>
</template>


