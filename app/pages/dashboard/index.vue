<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="mb-6">
          <v-breadcrumbs :items="['Home', 'Dashboard']" class="pa-0 mb-2">
            <template v-slot:prepend>
              <v-icon size="small" icon="mdi-home"></v-icon>
            </template>
          </v-breadcrumbs>
          <h1 class="text-h3 d-flex align-center">
            <v-icon class="mr-3" size="large" color="primary">mdi-view-dashboard</v-icon>
            Dashboard
          </h1>
        </div>
      </v-col>
    </v-row>

    <!-- Statistics Cards -->
    <v-row>
      <v-col cols="12" md="6" lg="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-grey">Total Categories</div>
                <div class="text-h4 mt-2">{{ categoriesStore.categories.length }}</div>
              </div>
              <v-avatar color="primary" size="56">
                <v-icon size="32">mdi-shape</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-grey">Total Products</div>
                <div class="text-h4 mt-2">{{ productsStore.products.length }}</div>
              </div>
              <v-avatar color="success" size="56">
                <v-icon size="32">mdi-package-variant</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-grey">Root Categories</div>
                <div class="text-h4 mt-2">{{ rootCategories }}</div>
              </div>
              <v-avatar color="info" size="56">
                <v-icon size="32">mdi-folder-outline</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-grey">Active User</div>
                <div class="text-h6 mt-2">{{ authStore.currentUser?.username }}</div>
              </div>
              <v-avatar color="warning" size="64">
                <v-icon size="32">mdi-account</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Actions -->
    <v-row class="mt-4">
      <v-col cols="12">
        <h2 class="text-h5 mb-4">Quick Actions</h2>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-shape</v-icon>
            Categories Management
          </v-card-title>
          <v-card-text>
            Manage your product categories, create hierarchies, and organize your products.
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" to="/dashboard/categories">
              Go to Categories
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-package-variant</v-icon>
            Products Management
          </v-card-title>
          <v-card-text>
            Add, edit, and manage your products. Assign them to categories and set prices.
          </v-card-text>
          <v-card-actions>
            <v-btn color="success" to="/dashboard/products">
              Go to Products
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../../stores/auth';
import { useCategoriesStore } from '../../../stores/categories';
import { useProductsStore } from '../../../stores/products';

useHead({
  title: 'Dashboard',
  meta: [
    { name: 'description', content: 'E-commerce dashboard overview with statistics and quick actions' }
  ]
});

const authStore = useAuthStore();
const categoriesStore = useCategoriesStore();
const productsStore = useProductsStore();

const rootCategories = computed(() => {
  return categoriesStore.categories.filter(cat => !cat.parentId).length;
});

onMounted(async () => {
  await Promise.all([
    categoriesStore.fetchCategories(),
    productsStore.fetchProducts()
  ]);
});
</script>
