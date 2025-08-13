<template>
  <transition name="fade">
    <div 
      class="fixed inset-0 overflow-hidden -z-10 opacity-0"
      @mousemove="handleMouseMove"
      @touchstart.passive
      v-show="show"
    >
      <div
        v-for="particle in particles"
        :key="particle.id"
        v-motion
        class="absolute rounded-full mix-blend-screen"
        :class="particle.color"
        :style="{
          ...particle.style,
          transform: `translate(${particle.parallaxX}px, ${particle.parallaxY}px)`,
          filter: `blur(${particle.blur}px) hue-rotate(${hueRotate}deg)`
        }"
        :initial="{
          x: particle.initial.x,
          y: particle.initial.y,
          scale: particle.initial.scale,
          opacity: particle.initial.opacity
        }"
        :animate="{
          x: particle.animate.x,
          y: particle.animate.y,
          opacity: particle.animate.opacity
        }"
        :transition="{
          duration: particle.transition.duration,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'reverse'
        }"
      />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue";

interface Particle {
  id: number;
  color: string;
  style: Record<string, string>;
  initial: { x: number; y: number; scale: number; opacity: number };
  animate: { x: number; y: number; opacity: number };
  transition: { duration: number };
  parallaxX: number;
  parallaxY: number;
  blur: number;
  depth: number;
}

const particles = ref<Particle[]>([]);
const hueRotate = ref(0);
const mouse = reactive({ x: 0, y: 0 });
const show = ref(false);

const particleColors = [
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-sky-500"
];

const particleCount = 25;
for (let i = 0; i < particleCount; i++) {
  const size = Math.random() * 40 + 10;
  const duration = Math.random() * 10 + 20;
  const xOffset = Math.random() * 50 - 25;
  const yOffset = Math.random() * 50 - 25;
  const depth = Math.random() * 0.6 + 0.4; // depth factor

  particles.value.push({
    id: i,
    color: particleColors[Math.floor(Math.random() * particleColors.length)],
    style: {
      width: `${size}px`,
      height: `${size}px`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`
    },
    initial: {
      x: 0,
      y: 0,
      scale: Math.random() * 0.5 + 0.5,
      opacity: Math.random() * 0.2 + 0.05
    },
    animate: {
      x: xOffset,
      y: yOffset,
      opacity: Math.random() * 0.2 + 0.1
    },
    transition: { duration },
    parallaxX: 0,
    parallaxY: 0,
    blur: Math.random() * 2 + 0.5,
    depth
  });
}

// Hue rotation (color shifting)
let hueInterval: number;
onMounted(() => {
  show.value = true;
  hueInterval = window.setInterval(() => {
    hueRotate.value = (hueRotate.value + 1) % 360;
  }, 50);
});
onUnmounted(() => clearInterval(hueInterval));

// Mouse-based parallax (disabled on mobile)
function handleMouseMove(e: MouseEvent) {
  if (window.innerWidth < 768) return; // disable parallax on mobile
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  mouse.x = (e.clientX - centerX) / centerX;
  mouse.y = (e.clientY - centerY) / centerY;

  particles.value.forEach((p) => {
    p.parallaxX = mouse.x * 30 * p.depth;
    p.parallaxY = mouse.y * 30 * p.depth;
  });
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
