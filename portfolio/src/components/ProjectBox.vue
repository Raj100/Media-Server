<!-- <script setup lang="ts">
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
      <img
        :src="props.imgSrc"
        :alt="props.imgAlt || 'Item image'"
        class="w-40 h-40 object-cover rounded-lg mb-4"
      />

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
</template> -->


<script setup lang="ts">
// Child Component (ProjectItem.vue)
import { computed } from 'vue'

interface ItemProps {
  imgSrc: string;
  imgAlt?: string;
  index: number;
  scrollTop: number;
  windowHeight: number;
}

const props = defineProps<ItemProps>();
const radius = 30;
const circumference = 2 * Math.PI * radius;

const progress = computed(() => {
  const start = props.index * props.windowHeight;
  const end = (props.index + 1) * props.windowHeight;
  let p = (props.scrollTop - start) / props.windowHeight;
  return Math.max(0, Math.min(1, p));
});
</script>

<template>
  <section class="project-section">
    <div class="project-content">
      <img
        :src="props.imgSrc"
        :alt="props.imgAlt || 'Project image'"
        class="project-image"
      />
      
      <div class="progress-indicator">
        <svg class="progress-svg" width="75" height="75" viewBox="0 0 100 100">
          <!-- Background Circle -->
          <circle
            cx="50"
            cy="50"
            :r="radius"
            fill="none"
            stroke="#e5e7eb"
            stroke-width="5"
            opacity="0.3"
          />
          <!-- Progress Circle -->
          <circle
            cx="50"
            cy="50"
            :r="radius"
            fill="none"
            stroke="#3b82f6"
            stroke-width="5"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="circumference * (1 - progress)"
          />
        </svg>
      </div>
    </div>
  </section>
</template>

<style scoped>
.project-section {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  scroll-snap-align: start;
}

.project-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 90vw;
  text-align: center;
}

.project-image {
  max-height: 60vh;
  max-width: 90vw;
  object-fit: contain;
  margin-bottom: 2rem;
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.progress-indicator {
  margin-top: 1rem;
}

.progress-svg {
  transform: rotate(-90deg);
}
</style>