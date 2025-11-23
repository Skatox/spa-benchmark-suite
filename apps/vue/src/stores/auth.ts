import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  clearToken,
  fetchCurrentUser,
  loginUser,
  registerUser,
  setToken,
  updateUserProfile,
  type User,
} from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => Boolean(user.value))

  const bootstrap = async () => {
    const existingToken = localStorage.getItem('realworld_token')
    if (!existingToken) return

    try {
      loading.value = true
      const { user: currentUser } = await fetchCurrentUser()
      user.value = currentUser
    } catch (err) {
      console.error('Failed to restore session', err)
      clearToken()
    } finally {
      loading.value = false
    }
  }

  const handleAuth = async (callback: () => Promise<{ user: User }>) => {
    loading.value = true
    error.value = null
    try {
      const { user: authenticatedUser } = await callback()
      setToken(authenticatedUser.token)
      user.value = authenticatedUser
      return authenticatedUser
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'Unable to authenticate'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  const login = (email: string, password: string) =>
    handleAuth(() => loginUser(email, password))

  const register = (username: string, email: string, password: string) =>
    handleAuth(() => registerUser(username, email, password))

  const logout = () => {
    user.value = null
    clearToken()
  }

  const updateProfile = async (payload: Partial<User> & { password?: string }) => {
    if (!user.value) return null
    const { user: updatedUser } = await updateUserProfile(payload)
    user.value = updatedUser
    setToken(updatedUser.token)
    return updatedUser
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    bootstrap,
    login,
    register,
    logout,
    updateProfile,
  }
})
