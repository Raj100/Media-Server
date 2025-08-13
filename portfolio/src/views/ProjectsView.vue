<script setup>
import { motion } from 'motion-v';
import Item from "../components/ProjectBox.vue";

const projects = [
  { image: '/project1.jpg', title: 'Project 1' },
  { image: '/project2.jpg', title: 'Project 2' },
  { image: '/project3.jpg', title: 'Project 3' },
];
const items = [
  { imgSrc: "https://images.unsplash.com/photo-1754851357071-e22af991e590?q=80&w=2832&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", imgAlt: "Ocean Dive" },
  { imgSrc: "/images/sheng.jpg", imgAlt: "Coral Reef" },
  { imgSrc: "https://images.unsplash.com/photo-1682686580036-b5e25932ce9a?q=80&w=1975&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", imgAlt: "Shipwreck" },
];
</script>

<template>
  <!-- <motion.div 
    :initial="{ scale: 0 }" 
    :animate="{ scale: 1 }" 
    :transition="{ duration: 0.5 }"
  >
    Hello, Motion!
  </motion.div> -->
  <Item
      :projects="projects"
    />
          <!-- :img-src="item.imgSrc"
      :img-alt="item.imgAlt" -->
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