<script setup lang="ts">
import { motion } from 'motion-v';
import StatusBar from "../components/StatusBar.vue";
import DownloadSection from "../components/DownloadSection.vue";
import { useDownloadStore } from "../stores/counter";


const store = useDownloadStore();

</script>

<template>
  <main>
      <motion.div 
    :initial="{ scale: 0 }" 
    :animate="{ scale: 1 }" 
    :transition="{ duration: 0.5 }"
  >
    Hello, Motion!
  </motion.div>
    <div class="p-6 space-y-8 max-w-3xl mx-auto">
    <!-- Header -->
    <motion.div
      :initial="{ opacity: 0, y: -20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.5 }"
    >
      <h1
        class="text-4xl font-extrabold text-center bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"
      >
        Dive Tools Dashboard
      </h1>
    </motion.div>

    <!-- Download Sections -->
    <DownloadSection
      title="Download from Web"
      placeholder="Enter web URL"
      color="blue"
      v-model="store.webUrl"
      :onDownload="store.startWebDownload"
      :delay="0.2"
    />

    <DownloadSection
      title="Download from Telegram"
      placeholder="Enter Telegram link"
      color="green"
      v-model="store.telegramUrl"
      :onDownload="store.startTelegramDownload"
      :delay="0.4"
    />

    <!-- Status Bar -->
    <StatusBar :progress="50" />

    <!-- Live Streaming -->
    <motion.div
      :initial="{ scale: 0.95, opacity: 0 }"
      :animate="{ scale: 1, opacity: 1 }"
      :transition="{ delay: 0.8, duration: 0.5 }"
      class="space-y-3"
    >
      <h2 class="text-xl font-bold">Live Streaming</h2>
      <video
        controls
        class="w-full max-w-lg border-2 border-gray-300 rounded-lg shadow-lg"
        src="http://localhost:5000/stream/sample.mp4"
      ></video>
    </motion.div>
  </div>
  </main>
</template>


