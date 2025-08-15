<script setup lang="ts">
import { motion } from 'motion-v';
import Item from "../components/ProjectBox.vue";

const items = [
  { imgSrc: "/images/photo1.jpg", imgAlt: "Ocean Dive" },
  { imgSrc: "/images/photo2.jpg", imgAlt: "Coral Reef" },
  { imgSrc: "/images/photo3.jpg", imgAlt: "Shipwreck" },
];
</script>

<template>
  <motion.div 
    :initial="{ scale: 0 }" 
    :animate="{ scale: 1 }" 
    :transition="{ duration: 0.5 }"
  >
    Hello, Motion!
  </motion.div>
  <Item
      v-for="(item, index) in items"
      :key="index"
      :img-src="item.imgSrc"
      :img-alt="item.imgAlt"
    />
</template>
<!-- <template>
  <div class="h-full overflow-y-scroll snap-y snap-mandatory">
    <div v-for="project in projects" :key="project.id"
      @click="$router.push(`/projects/${project.id}`)"
      class="bg-gray-800 text-white p-4 rounded-xl cursor-pointer hover:scale-105 transition-transform flex-shrink-0 w-full snap-start"
      style="height: 100vh;">
      <h2 class="text-xl font-bold mb-2">{{ project.title }}</h2>
      <p>{{ project.short }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const projects = [
  { id: 'esc-bldc', title: 'ESC for BLDC Motor', short: 'High-power ESC with zero crossing control' },
  { id: 'vocab-tool', title: 'Vocab Tool', short: 'Cross-platform vocabulary builder' },
  { id: 's3-stream', title: 'S3-like Streaming System', short: 'Home-server streaming & MLOps platform' },
]
</script> -->