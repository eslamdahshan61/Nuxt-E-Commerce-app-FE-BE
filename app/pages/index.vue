<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <p class="mt-4 text-h6">Loading...</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import {useAuthStore } from '../../stores/auth';
const router = useRouter();

onMounted(() => {
  const authStore = useAuthStore();
  authStore.initializeAuth();
  
  if (authStore.isAuthenticated) {
    router.push('/dashboard');
  } else {
    router.push('/login');
  }
});
</script>
