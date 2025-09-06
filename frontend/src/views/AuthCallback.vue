<template>
  <div class="callback-view">
    <p>Authenticating...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '../stores/auth'

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  const code = route.query.code;
  if (!code) {
    // If no code, something went wrong, redirect to login
    router.push('/login?error=no_code');
    return;
  }
try{
  await authStore.callback(code)
  router.push('/dashboard');
}
catch(e){
    router.push('/Login');
}
  
});
</script>