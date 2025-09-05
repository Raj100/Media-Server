<!-- <template>
  <div class="flex flex-col items-center">
    <h2 class="text-xl font-bold mb-4">Secure Video Player</h2>

    <video
      ref="videoEl"
      controls
      autoplay
      playsinline
      class="rounded-lg shadow-lg max-w-3xl w-full"
    ></video>

    <div v-if="error" class="text-red-500 mt-3">{{ error }}</div>
    <div v-if="loading" class="text-gray-500 mt-3">Loading video...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Hls from "hls.js";
import { apiClient } from "@/lib/api"; // your axios wrapper

const videoEl = ref<HTMLVideoElement | null>(null);
const error = ref<string | null>(null);
const loading = ref<boolean>(false);

// Replace with dynamic videoId from route/store
const videoId = "4c958616-630a-4d83-9f33-593cf0684095";

onMounted(async () => {
  try {
    loading.value = true;

    // Step 1: Request dynamic stream URL + token
    const res = await apiClient.get(`/get_stream_url/${videoId}`);
    const { url } = res.data;
    console.log("Stream URL:", url);


if (Hls.isSupported()) {
  const hls = new Hls();

  hls.on(Hls.Events.MANIFEST_PARSED, () => {
  console.log("Manifest parsed, starting playback...");
  videoEl.value!.play();
});

hls.on(Hls.Events.ERROR, (event, data) => {
  console.error("HLS error:", data);
});


  hls.loadSource(url); // url already has ?token=... in it
  hls.attachMedia(videoEl.value!);
} else if (videoEl.value!.canPlayType("application/vnd.apple.mpegurl")) {
  // Safari
  videoEl.value!.src = url;
} else {
  error.value = "Your browser does not support HLS playback.";
}

  } catch (err: any) {
    error.value = err.response?.data?.detail || "Failed to load video.";
  } finally {
    loading.value = false;
  }
});


</script>

<style scoped>
video {
  max-height: 70vh;
  background: black;
}
</style> -->

<template>
  <div class="flex flex-col items-center">
    <h2 class="text-xl font-bold mb-4">Secure Video Player</h2>

    <video
      ref="videoEl"
      controls
      autoplay
      muted
      playsinline
      class="rounded-lg shadow-lg max-w-3xl w-full"
    ></video>

    <!-- Manual quality selection -->
    <div v-if="levels.length" class="flex gap-2 mt-3">
      <button
        v-for="(level, i) in levels"
        :key="i"
        @click="setQuality(i)"
        class="px-3 py-1 rounded border hover:bg-gray-100"
      >
        {{ level.height }}p
      </button>
      <button @click="autoQuality" class="px-3 py-1 rounded border bg-blue-500 text-white">
        Auto
      </button>
    </div>

    <div v-if="error" class="text-red-500 mt-3">{{ error }}</div>
    <div v-if="loading" class="text-gray-500 mt-3">Loading video...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Hls from "hls.js";
import { apiClient } from "@/lib/api";

const videoEl = ref<HTMLVideoElement | null>(null);
const error = ref<string | null>(null);
const loading = ref<boolean>(false);
const levels = ref<any[]>([]);
let hls: Hls | null = null;

const videoId = "ad9c5496-b81b-4f8c-954a-e353186d43e8";

function setQuality(levelIndex: number) {
  if (hls) {
    hls.currentLevel = levelIndex;
  }
}

function autoQuality() {
  if (hls) {
    hls.currentLevel = -1; // Auto adaptive
  }
}

onMounted(async () => {
  try {
    loading.value = true;
    const res = await apiClient.get(`/get_stream_url/${videoId}`);
    const { url } = res.data;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(videoEl.value!);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        console.log("Available levels:", data.levels);
        console.log(levels)
        levels.value = data.levels.map((l: any) => ({
          height: l.height,
          bitrate: l.bitrate,
        }));
        videoEl.value!.play();
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        console.error("HLS error:", data);
        error.value = `Playback error: ${data.details}`;
      });
    } else if (videoEl.value!.canPlayType("application/vnd.apple.mpegurl")) {
      videoEl.value!.src = url; // Safari
    } else {
      error.value = "Your browser does not support HLS playback.";
    }
  } catch (err: any) {
    error.value = err.response?.data?.detail || "Failed to load video.";
  } finally {
    loading.value = false;
  }
});
</script>
