import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})

export const useDownloadStore = defineStore("download", {
  state: () => ({
    webUrl: "",
    telegramUrl: "",
  }),
  actions: {
    async startWebDownload() {
      if (!this.webUrl) return;
      await fetch("http://localhost:5000/download/web", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: this.webUrl }),
      });
      this.webUrl = "";
    },
    async startTelegramDownload() {
      if (!this.telegramUrl) return;
      await fetch("http://localhost:5000/download/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramLink: this.telegramUrl }),
      });
      this.telegramUrl = "";
    },
  },
});