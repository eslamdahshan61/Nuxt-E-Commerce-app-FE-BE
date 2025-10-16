<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <!-- Header -->
        <div class="mb-4">
          <v-breadcrumbs :items="['Home', 'Dashboard', 'Categories']" class="pa-0 mb-2">
            <template v-slot:prepend>
              <v-icon size="small" icon="mdi-home"></v-icon>
            </template>
          </v-breadcrumbs>
          <div class="d-flex justify-space-between align-center">
            <h1 class="text-h4 d-flex align-center">
              <v-icon class="mr-3" size="large" color="primary">mdi-shape</v-icon>
              Categories Management
            </h1>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="openCreateDialog"
            >
              Add Category
            </v-btn>
          </div>
        </div>

        <!-- Loading -->
        <v-progress-linear
          v-if="categoriesStore.loading"
          indeterminate
          color="primary"
        />

        <!-- Error Alert -->
        <v-alert
          v-if="categoriesStore.error"
          type="error"
          variant="tonal"
          closable
          class="mb-4"
        >
          {{ categoriesStore.error }}
        </v-alert>

        <!-- Categories Table -->
        <v-card>
          <v-data-table
            :headers="headers"
            :items="hierarchicalCategories"
            :loading="categoriesStore.loading"
            class="elevation-1"
            :items-per-page="-1"
          >
            <!-- Name with hierarchy -->
            <template v-slot:item.name="{ item }">
              <div>
                <div class="d-flex align-center" :style="{ paddingLeft: (item.level * 24) + 'px' }">
                  <v-icon v-if="!item.parentId" class="mr-2" color="primary">
                    mdi-folder
                  </v-icon>
                  <v-icon v-else class="mr-2" color="grey">
                    mdi-folder-outline
                  </v-icon>
                  <span class="font-weight-medium">{{ item.name }}</span>
                </div>
              </div>
            </template>

            <!-- Direct Products Count -->
            <template v-slot:item.directProducts="{ item }">
              <v-chip size="small" color="blue" variant="tonal">
                {{ item._count?.products || 0 }}
              </v-chip>
            </template>

            <!-- Recursive Product Count (Event-driven cache) -->
            <template v-slot:item.recursiveProductCount="{ item }">
              <v-tooltip text="Total products in this category and all subcategories">
                <template v-slot:activator="{ props }">
                  <v-chip
                    v-bind="props"
                    size="small"
                    :color="item.recursiveProductCount > 0 ? 'success' : 'grey'"
                    variant="tonal"
                  >
                    <v-icon left class="mx-1" size="small">mdi-package-variant-closed</v-icon>
                    {{ item.recursiveProductCount || 0 }}
                  </v-chip>
                </template>
              </v-tooltip>
            </template>

            <!-- Children Categories -->
            <template v-slot:item.children="{ item }">
              <v-chip
                v-if="item.children && item.children.length > 0"
                size="small"
                color="purple"
                variant="tonal"
              >
                {{ item.children.length }}
              </v-chip>
              <span v-else class="text-grey">—</span>
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
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ isEditing ? 'Edit Category' : 'Create Category' }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="formRef" v-model="valid">
            <v-text-field
              v-model="formData.name"
              label="Category Name"
              :rules="nameRules"
              required
              class="mb-2"
            />

            <v-select
              v-model="formData.parentId"
              :items="parentCategories"
              item-title="name"
              item-value="id"
              label="Parent Category"
              clearable
              hint="Select a parent category or leave empty for root category"
              persistent-hint
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            text="Cancel"
            @click="dialog = false"
          />
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
        <v-card-title class="text-h5">
          Confirm Delete
        </v-card-title>

        <v-card-text>
          Are you sure you want to delete <strong>{{ categoryToDelete?.name }}</strong>?
          <!-- <div v-if="categoryToDelete?.children && categoryToDelete.children.length > 0" class="mt-2">
            <v-alert type="warning" variant="tonal" density="compact">
              This category has {{ categoryToDelete.children.length }} subcategory(ies).
            </v-alert>
          </div> -->
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            text="Cancel"
            @click="deleteDialog = false"
          />
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
import {useCategoriesStore} from '../../../stores/categories';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '~/types';

definePageMeta({
  middleware: 'auth',
});

useHead({
  title: 'Categories Management',
  meta: [
    { name: 'description', content: 'Manage product categories with hierarchical organization and CRUD operations' }
  ]
});

const categoriesStore = useCategoriesStore();

const dialog = ref(false);
const deleteDialog = ref(false);
const formRef = ref();
const valid = ref(false);
const loading = ref(false);
const isEditing = ref(false);
const editingId = ref<number | null>(null);
const categoryToDelete = ref<Category | null>(null);

const formData = ref<CreateCategoryDto | UpdateCategoryDto>({
  name: '',
  parentId: undefined,
});

const headers = [
  { title: 'Category Hierarchy', key: 'name', sortable: false },
  { title: 'Direct Products', key: 'directProducts', sortable: false },
  { title: 'Total Products (Recursive)', key: 'recursiveProductCount', sortable: false },
  { title: 'Subcategories', key: 'children', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const nameRules = [
  (v: string) => !!v || 'Name is required',
  (v: string) => v.length >= 2 || 'Name must be at least 2 characters',
  (v: string) => v.length <= 50 || 'Name must not exceed 50 characters',
];

const buildHierarchicalList = (categories: Category[]): Category[] => {
  const hierarchical: Category[] = [];
  
  const addCategoryWithChildren = (category: Category, level: number = 0) => {
    hierarchical.push({ ...category, level } as any);
    
    const children = categories.filter(c => c.parentId === category.id);
    children.forEach(child => {
      addCategoryWithChildren(child, level + 1);
    });
  };
  
  const rootCategories = categories.filter(c => !c.parentId);
  rootCategories.forEach(root => {
    addCategoryWithChildren(root, 0);
  });
  
  return hierarchical;
};

const hierarchicalCategories = computed(() => {
  return buildHierarchicalList(categoriesStore.categories);
});

const parentCategories = computed(() => {
  return categoriesStore.categories.filter(cat => {
    if (isEditing.value && editingId.value) {
      return cat.id !== editingId.value;
    }
    return true;
  });
});

const openCreateDialog = () => {
  isEditing.value = false;
  editingId.value = null;
  formData.value = { name: '', parentId: undefined };
  dialog.value = true;
};

const openEditDialog = (category: Category) => {
  isEditing.value = true;
  editingId.value = category.id;
  formData.value = {
    name: category.name,
    parentId: category.parentId || undefined,
  };
  dialog.value = true;
};

const handleSave = async () => {
  if (!valid.value) return;

  loading.value = true;
  try {
    if (isEditing.value && editingId.value) {
      await categoriesStore.updateCategory(editingId.value, formData.value);
    } else {
      await categoriesStore.createCategory(formData.value as CreateCategoryDto);
    }
    dialog.value = false;
    await categoriesStore.fetchCategories();
  } catch (error: any) {
    console.error('Save error:', error);
  } finally {
    loading.value = false;
  }
};

const confirmDelete = (category: Category) => {
  categoryToDelete.value = category;
  deleteDialog.value = true;
};

const handleDelete = async () => {
  if (!categoryToDelete.value) return;

  loading.value = true;
  try {
    await categoriesStore.deleteCategory(categoryToDelete.value.id);
    deleteDialog.value = false;
    await categoriesStore.fetchCategories();
  } catch (error: any) {
    console.error('Delete error:', error);
  } finally {
    loading.value = false;
    deleteDialog.value = false;
  }
};

onMounted(async () => {
  await categoriesStore.fetchCategories();
});
</script>
