<script setup lang="ts">
import { ref } from "vue";
import { motion, useScroll } from "motion-v";

interface ItemProps {
  imgSrc: string;
  imgAlt?: string;
}

const props = defineProps<ItemProps>();

const elementRef = ref<HTMLElement | null>(null);

const { scrollYProgress } = useScroll({
  target: elementRef,
  offset: ["end end", "start start"],
});
</script>

<template>
  <section class="flex justify-center items-center p-8">
    <div
      ref="elementRef"
      class="flex flex-col justify-center items-center border border-gray-300 rounded-xl p-6 shadow-lg bg-white"
    >
      <!-- Image -->
      <img
        :src="props.imgSrc"
        :alt="props.imgAlt || 'Item image'"
        class="w-40 h-40 object-cover rounded-lg mb-4"
      />

      <!-- Progress Circle -->
      <figure class="flex justify-center items-center">
        <svg class="-rotate-90" width="75" height="75" viewBox="0 0 100 100">
          <circle
            class="text-gray-300 opacity-30"
            cx="50"
            cy="50"
            r="30"
            pathLength="1"
            fill="none"
            stroke="currentColor"
            stroke-width="5"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="30"
            pathLength="1"
            :style="{
              pathLength: scrollYProgress,
              stroke: '#3b82f6',
              strokeWidth: 5,
              strokeLinecap: 'round',
              fill: 'none'
            }"
          />
        </svg>
      </figure>
    </div>
  </section>
</template>
