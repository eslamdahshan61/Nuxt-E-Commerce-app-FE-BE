<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="fill-height">
      <!-- Left side - Branding -->
      <v-col cols="12" md="6" class="d-none d-md-flex primary darken-1">
        <v-container class="fill-height d-flex flex-column justify-center align-center text-center white--text">
          <v-icon size="120" color="white" class="mb-6">mdi-shopping</v-icon>
          <h1 class="text-h2 font-weight-bold mb-4">E-Commerce</h1>
          <p class="text-h6 font-weight-light">
            Manage your products and categories with ease
          </p>
        </v-container>
      </v-col>

      <!-- Right side - Login Form -->
      <v-col cols="12" md="6">
        <v-container class="fill-height">
          <v-row justify="center" align="center">
            <v-col cols="12" sm="8" md="8" lg="6">
              <div class="text-center mb-8">
                <h2 class="text-h4 font-weight-bold mb-2">Welcome Back</h2>
                <p class="text-subtitle-1 text-medium-emphasis">
                  Sign in to continue
                </p>
              </div>

              <v-card elevation="0" class="pa-6">
                <v-form ref="formRef" v-model="valid" @submit.prevent="handleLogin">
                  <!-- Identifier Field (Email or Username) -->
                  <v-text-field
                    v-model="identifier"
                    label="Email or Username"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    :rules="identifierRules"
                    :error-messages="fieldErrors.identifier"
                    required
                    class="mb-2"
                  />

                  <!-- Password Field -->
                  <v-text-field
                    v-model="password"
                    label="Password"
                    prepend-inner-icon="mdi-lock"
                    :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="showPassword ? 'text' : 'password'"
                    variant="outlined"
                    :rules="passwordRules"
                    :error-messages="fieldErrors.password"
                    required
                    class="mb-4"
                    @click:append-inner="showPassword = !showPassword"
                  />

                  <!-- Error Alert -->
                  <v-alert
                    v-if="error"
                    type="error"
                    variant="tonal"
                    class="mb-4"
                    closable
                    @click:close="error = null"
                  >
                    {{ error }}
                  </v-alert>

                  <!-- Login Button -->
                  <v-btn
                    type="submit"
                    color="primary"
                    size="large"
                    block
                    :loading="loading"
                    :disabled="!valid || loading"
                    class="mb-4"
                  >
                    <v-icon left class="mr-2">mdi-login</v-icon>
                    Sign In
                  </v-btn>

                  <!-- Demo Credentials -->
                  <v-divider class="my-4" />
                  
                  <div class="text-center">
                    <p class="text-caption text-medium-emphasis mb-2">Demo Credentials:</p>
                    <v-chip size="small" class="mr-2" @click="fillDemoCredentials">
                      <v-icon left size="small">mdi-account</v-icon>
                      admin / admin
                    </v-chip>
                  </div>
                </v-form>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import {useAuthStore } from '../../stores/auth';
definePageMeta({
  layout: false,
});

const authStore = useAuthStore();
const router = useRouter();

const formRef = ref();
const valid = ref(false);
const identifier = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);
const fieldErrors = ref<{ identifier?: string; password?: string }>({});

const identifierRules = [
  (v: string) => !!v || 'Email or username is required',
  (v: string) => v.length >= 3 || 'Must be at least 3 characters',
];

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 3 || 'Must be at least 3 characters',
];

const fillDemoCredentials = () => {
  identifier.value = 'admin';
  password.value = 'admin';
};

const handleLogin = async () => {
  if (!valid.value) return;

  loading.value = true;
  error.value = null;
  fieldErrors.value = {};

  try {
    const success = await authStore.login({
      identifier: identifier.value,
      password: password.value,
    });
    
    if (success) {
      router.push('/dashboard');
    } else {
      
      fieldErrors.value = authStore.fieldErrors;
      error.value = authStore.error;
    }
  } catch (err: any) {
    error.value = err.message || 'Something went wrong';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard');
  }
});
</script>

<style scoped>
.fill-height {
  height: 100vh;
}
</style>
