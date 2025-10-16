<template>
  <v-layout>
    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      @click="rail = false"
    >
      <v-list-item
        prepend-icon="mdi-shopping"
        :title="rail ? '' : 'E-Commerce'"
        nav
      >
        <template v-slot:append>
          <v-btn
            v-if="!rail"
            icon="mdi-chevron-left"
            variant="text"
            @click.stop="rail = !rail"
          />
        </template>
      </v-list-item>

      <v-divider />

      <v-list density="compact" nav>
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          value="dashboard"
          to="/dashboard"
        />
        <v-list-item
          prepend-icon="mdi-shape"
          title="Categories"
          value="categories"
          to="/dashboard/categories"
        />
        <v-list-item
          prepend-icon="mdi-package-variant"
          title="Products"
          value="products"
          to="/dashboard/products"
        />
          <v-list-item
          prepend-icon="mdi-api"
          title="Api Docs"
          value="api-docs"
          href="/api-docs"
          target="_blank"
        />
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar elevation="1">
      <v-app-bar-nav-icon
        v-if="rail"
        @click.stop="rail = !rail"
      />

      <v-app-bar-title>
        {{ pageTitle }}
      </v-app-bar-title>

      <v-spacer />

      <!-- User Menu -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            v-bind="props"
          >
            <v-avatar color="primary" size="36">
              <v-icon>mdi-account</v-icon>
            </v-avatar>
          </v-btn>
        </template>

        <v-list>
          <v-list-item>
            <v-list-item-title>
              {{ authStore.currentUser?.username }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ authStore.currentUser?.email }}
            </v-list-item-subtitle>
          </v-list-item>

          <v-divider />

          <v-list-item
            prepend-icon="mdi-logout"
            title="Logout"
            @click="handleLogout"
          />
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <NuxtPage />
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import {useAuthStore } from '../../stores/auth';

definePageMeta({
  middleware: 'auth',
});

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const drawer = ref(true);
const rail = ref(false);

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/categories': 'Categories Management',
    '/dashboard/products': 'Products Management',
  };
  return titles[route.path] || 'E-Commerce';
});

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>
