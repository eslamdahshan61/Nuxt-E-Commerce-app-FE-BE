import { defineStore } from 'pinia';
import { useApi } from '../composables/useApi';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../types';

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    categories: [] as Category[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    rootCategories: (state) => state.categories.filter(cat => !cat.parentId),
    
    getCategoryById: (state) => (id: number) => {
      return state.categories.find(cat => cat.id === id);
    },

    getChildCategories: (state) => (parentId: number) => {
      return state.categories.filter(cat => cat.parentId === parentId);
    },
  },

  actions: {
    async fetchCategories(page = 1, limit = 10) {
      this.loading = true;
      this.error = null;

      try {
        const api = useApi();
        const { data } = await api.get<any>('/api/categories', {
          params: { page, limit }
        });
        this.categories = data.data;
        return data.meta;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Could not load categories';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchCategory(id: number) {
      try {
        const api = useApi();
        const { data } = await api.get<Category>(`/api/categories/${id}`);
        
        const idx = this.categories.findIndex(cat => cat.id === id);
        if (idx !== -1) {
          this.categories[idx] = data;
        } else {
          this.categories.push(data);
        }
        
        return data;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Could not load category';
        throw err;
      }
    },

    async createCategory(dto: CreateCategoryDto) {
      this.loading = true;
      this.error = null;

      try {
        const api = useApi();
        const { data } = await api.post<Category>('/api/categories', dto);
        this.categories.push(data);
        return data;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Unable to create category';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateCategory(id: number, dto: UpdateCategoryDto) {
      this.loading = true;
      this.error = null;

      try {
        const api = useApi();
        const { data } = await api.put<Category>(`/api/categories/${id}`, dto);
        
        const idx = this.categories.findIndex(cat => cat.id === id);
        if (idx !== -1) {
          this.categories[idx] = data;
        }
        
        return data;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Unable to update category';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteCategory(id: number) {
      this.loading = true;
      this.error = null;

      try {
        const api = useApi();
        await api.delete(`/api/categories/${id}`);
        
        this.categories = this.categories.filter(cat => cat.id !== id);
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Unable to delete category';
        throw err;
      } finally {
        this.loading = false;
        
      }
    },
  },
});
