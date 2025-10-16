<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <!-- Header -->
        <div class="mb-4">
          <v-breadcrumbs :items="['Home', 'Dashboard', 'Products']" class="pa-0 mb-2">
            <template v-slot:prepend>
              <v-icon size="small" icon="mdi-home"></v-icon>
            </template>
          </v-breadcrumbs>
          <div class="d-flex justify-space-between align-center">
            <h1 class="text-h4 d-flex align-center">
              <v-icon class="mr-3" size="large" color="primary">mdi-package-variant</v-icon>
              Products Management
            </h1>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="openCreateDialog"
            >
              Add Product
            </v-btn>
          </div>
        </div>

        <!-- Loading -->
        <v-progress-linear
          v-if="productsStore.loading"
          indeterminate
          color="primary"
        />

        <!-- Error Alert -->
        <v-alert
          v-if="productsStore.error"
          type="error"
          variant="tonal"
          closable
          class="mb-4"
        >
          {{ productsStore.error }}
        </v-alert>

        <!-- Filters -->
        <v-card class="mb-4 pa-4">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="searchQuery"
                label="Search products"
                prepend-inner-icon="mdi-magnify"
                clearable
                @input="debouncedSearch"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="filterCategoryId"
                :items="categoriesStore.categories"
                item-title="name"
                item-value="id"
                label="Filter by Category"
                clearable
                @update:model-value="loadProducts"
              />
            </v-col>
          </v-row>
        </v-card>

        <!-- Products Table -->
        <v-card>
          <v-data-table
            :headers="headers"
            :items="productsStore.products"
            :loading="productsStore.loading"
            class="elevation-1"
          >
            <!-- Price -->
            <template v-slot:item.price="{ item }">
              <span class="font-weight-bold">${{ Number(item.price).toFixed(2) }}</span>
            </template>

            <!-- Category -->
            <template v-slot:item.category="{ item }">
              <div v-if="item.category">
                <div class="d-flex align-center gap-1">
                  <v-chip size="small" color="primary" variant="tonal">
                    {{ item.category.name }}
                  </v-chip>
                </div>
                <div v-if="getCategoryPath(item.category).length > 1" class="text-caption text-grey">
                 {{ getCategoryPath(item.category).join(' > ') }}
                </div>
              </div>
            </template>

            <!-- Actions -->
            <template v-slot:item.actions="{ item }">
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                @click="openEditDialog(item)"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="confirmDelete(item)"
              />
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="800">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ isEditing ? 'Edit Product' : 'Create Product' }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="formRef" v-model="valid">
            <v-text-field
              v-model="formData.name"
              label="Product Name"
              :rules="nameRules"
              required
              class="mb-2"
            />

            <v-textarea
              v-model="formData.description"
              label="Description"
              :rules="descriptionRules"
              required
              rows="3"
              class="mb-2"
            />

            <v-text-field
              v-model.number="formData.price"
              label="Price"
              type="number"
              step="0.01"
              prefix="$"
              :rules="priceRules"
              required
              class="mb-2"
            />

            <v-select
              v-model="formData.categoryId"
              :items="categoriesStore.categories"
              item-title="name"
              item-value="id"
              label="Category"
              :rules="categoryRules"
              required
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text="Cancel" @click="dialog = false" />
          <v-btn
            color="primary"
            text="Save"
            :loading="loading"
            :disabled="!valid || loading"
            @click="handleSave"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete <strong>{{ productToDelete?.name }}</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text="Cancel" @click="deleteDialog = false" />
          <v-btn
            color="error"
            text="Delete"
            :loading="loading"
            @click="handleDelete"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { useCategoriesStore } from '../../../stores/categories';
import { useProductsStore } from '../../../stores/products';
import type { Product, CreateProductDto, UpdateProductDto } from '~/types';

definePageMeta({
  middleware: 'auth',
});

useHead({
  title: 'Products Management',
  meta: [
    { name: 'description', content: 'Manage products with category assignments, pricing, and inventory tracking' }
  ]
});

const productsStore = useProductsStore();
const categoriesStore = useCategoriesStore();

const dialog = ref(false);
const deleteDialog = ref(false);
const formRef = ref();
const valid = ref(false);
const loading = ref(false);
const isEditing = ref(false);
const editingId = ref<number | null>(null);
const productToDelete = ref<Product | null>(null);
const searchQuery = ref('');
const filterCategoryId = ref<number | undefined>(undefined);

const formData = ref<CreateProductDto | UpdateProductDto>({
  name: '',
  description: '',
  price: 0,
  categoryId: undefined,
});

const headers = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Description', key: 'description', sortable: false },
  { title: 'Price', key: 'price', sortable: true },
  { title: 'Category', key: 'category', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
];

const nameRules = [
  (v: string) => !!v || 'Name is required',
  (v: string) => v.length >= 2 || 'Name must be at least 2 characters',
];

const descriptionRules = [
  (v: string) => !!v || 'Description is required',
  (v: string) => v.length >= 10 || 'Description must be at least 10 characters',
];

const priceRules = [
  (v: number) => !!v || v === 0 || 'Price is required',
  (v: number) => v >= 0 || 'Price must be positive',
];

const categoryRules = [
  (v: number) => !!v || 'Category is required',
];

const getCategoryPath = (category: any): string[] => {
  const path: string[] = [];
  
  const buildPath = (cat: any) => {
    if (!cat) return;
    
    if (cat.parent) {
      buildPath(cat.parent);
      path.push(cat.parent.name);
    } else if (cat.parentId) {
      const parentCat = categoriesStore.categories.find(c => c.id === cat.parentId);
      if (parentCat) {
        buildPath(parentCat);
        path.push(parentCat.name);
      }
    }
  };
  
  buildPath(category);
  
  return path;
};

const loadProducts = async () => {
  await productsStore.fetchProducts(filterCategoryId.value, searchQuery.value);
};

let searchTimeout: NodeJS.Timeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadProducts();
  }, 500);
};

const openCreateDialog = () => {
  isEditing.value = false;
  editingId.value = null;
  formData.value = { name: '', description: '', price: 0, categoryId: undefined };
  dialog.value = true;
};

const openEditDialog = (product: Product) => {
  isEditing.value = true;
  editingId.value = product.id;
  formData.value = {
    name: product.name,
    description: product.description,
    price: Number(product.price),
    categoryId: product.categoryId,
  };
  dialog.value = true;
};

const handleSave = async () => {
  if (!valid.value) return;

  loading.value = true;
  try {
    if (isEditing.value && editingId.value) {
      await productsStore.updateProduct(editingId.value, formData.value);
    } else {
      await productsStore.createProduct(formData.value as CreateProductDto);
    }
    dialog.value = false;
    setTimeout(() => {
      categoriesStore.fetchCategories();
    }, 2000);
  } catch (error: any) {
    console.error('Save error:', error);
  } finally {
    loading.value = false;
  }
};

const confirmDelete = (product: Product) => {
  productToDelete.value = product;
  deleteDialog.value = true;
};

const handleDelete = async () => {
  if (!productToDelete.value) return;

  loading.value = true;
  try {
    await productsStore.deleteProduct(productToDelete.value.id);
    deleteDialog.value = false;
    setTimeout(() => {
      categoriesStore.fetchCategories();
    }, 2000);
  } catch (error: any) {
    console.error('Delete error:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await Promise.all([
    categoriesStore.fetchCategories(),
    productsStore.fetchProducts(),
  ]);
});
</script>
