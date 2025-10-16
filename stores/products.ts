import { defineStore } from 'pinia';
import { useApi } from '../composables/useApi';
import type { Product, CreateProductDto, UpdateProductDto } from '../types';

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [] as Product[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getProductById: (state) => (id: number) => {
      return state.products.find(prod => prod.id === id);
    },

    getProductsByCategory: (state) => (categoryId: number) => {
      return state.products.filter(prod => prod.categoryId === categoryId);
    },
  },

  actions: {
    async fetchProducts(categoryId?: number, search?: string, page = 1, limit = 10) {
      this.loading = true;
      this.error = null;

      try {
        const api = useApi();
        const params: any = { page, limit };
        if (categoryId) params.categoryId = categoryId;
        if (search) params.search = search;

        const { data } = await api.get<any>('/api/products', { params });
        this.products = data.data;
        return data.meta;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Could not load products';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchProduct(id: number) {
      try {
        const api = useApi();
        const { data } = await api.get<Product>(`/api/products/${id}`);
        
        const idx = this.products.findIndex(prod => prod.id === id);
        if (idx !== -1) {
          this.products[idx] = data;
        } else {
          this.products.push(data);
        }
        
        return data;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Could not load product';
        throw err;
      }
    },

    async createProduct(dto: CreateProductDto) {
      this.loading = true;
      this.error = null;

      try {
        const api = useApi();
        const { data } = await api.post<Product>('/api/products', dto);
        this.products.push(data);
        return data;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Unable to create product';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateProduct(id: number, dto: UpdateProductDto) {
      this.loading = true;
      this.error = null;

      try {
        const api = useApi();
        const { data } = await api.put<Product>(`/api/products/${id}`, dto);
        
        const idx = this.products.findIndex(prod => prod.id === id);
        if (idx !== -1) {
          this.products[idx] = data;
        }
        
        return data;
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Unable to update product';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteProduct(id: number) {
      this.loading = true;
      this.error = null;

      try {
        const api = useApi();
        await api.delete(`/api/products/${id}`);
        
        this.products = this.products.filter(prod => prod.id !== id);
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Unable to delete product';
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
