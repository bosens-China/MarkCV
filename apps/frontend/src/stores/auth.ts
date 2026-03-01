import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { fetchCurrentUser, logout, type AuthUser } from '../api/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null);
  const isReady = ref(false);
  const isLoading = ref(false);

  const isAuthenticated = computed(() => !!user.value);

  async function init() {
    isLoading.value = true;
    try {
      user.value = await fetchCurrentUser();
    } catch {
      user.value = null;
    } finally {
      isLoading.value = false;
      isReady.value = true;
    }
  }

  async function refreshMe() {
    try {
      user.value = await fetchCurrentUser();
    } catch {
      user.value = null;
    }
  }

  async function signOut() {
    await logout();
    user.value = null;
  }

  return {
    user,
    isReady,
    isLoading,
    isAuthenticated,
    init,
    refreshMe,
    signOut,
  };
});
