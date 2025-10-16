import { useAuthStore } from '../../stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore();
    
    if (import.meta.client && !authStore.token) {
        authStore.initializeAuth();
    }

    if (!authStore.isAuthenticated) {
        return navigateTo("/login");
    }
});
