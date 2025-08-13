<script setup lang="ts">
import { m } from "motion-v";

defineProps<{ progress?: number }>();
</script>

<template>
  <m.div
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
    :transition="{ duration: 0.4 }"
    class="w-full bg-gray-200 rounded-full h-3"
  >
    <div
      class="bg-blue-500 h-3 rounded-full transition-all duration-500"
      :style="{ width: `${progress || 50}%` }"
    ></div>
  </m.div>
</template>
