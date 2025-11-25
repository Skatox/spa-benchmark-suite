import { create } from 'zustand'
import {
  clearToken,
  fetchCurrentUser,
  loginUser,
  registerUser,
  setToken,
  updateUserProfile,
  type User,
} from '../services/api'

type AuthState = {
  user: User | null
  loading: boolean
  error: string | null
  bootstrapped: boolean
  isAuthenticated: boolean
  bootstrap: () => Promise<void>
  login: (email: string, password: string) => Promise<User | null>
  register: (username: string, email: string, password: string) => Promise<User | null>
  logout: () => void
  updateProfile: (payload: Partial<User> & { password?: string }) => Promise<User | null>
}

const formatError = (error: unknown) => {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Unexpected error during authentication'
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  bootstrapped: false,
  isAuthenticated: false,
  bootstrap: async () => {
    if (get().bootstrapped) return

    const existingToken = localStorage.getItem('realworld_token')
    if (!existingToken) {
      set({ bootstrapped: true })
      return
    }

    set({ loading: true, error: null })
    try {
      const { user } = await fetchCurrentUser()
      setToken(user.token)
      set({ user, isAuthenticated: true })
    } catch (error) {
      clearToken()
      set({ user: null, isAuthenticated: false, error: formatError(error) })
    } finally {
      set({ loading: false, bootstrapped: true })
    }
  },
  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { user } = await loginUser(email, password)
      setToken(user.token)
      set({ user, isAuthenticated: true })
      return user
    } catch (error) {
      set({ error: formatError(error) })
      return null
    } finally {
      set({ loading: false, bootstrapped: true })
    }
  },
  register: async (username, email, password) => {
    set({ loading: true, error: null })
    try {
      const { user } = await registerUser(username, email, password)
      setToken(user.token)
      set({ user, isAuthenticated: true })
      return user
    } catch (error) {
      set({ error: formatError(error) })
      return null
    } finally {
      set({ loading: false, bootstrapped: true })
    }
  },
  logout: () => {
    clearToken()
    set({ user: null, isAuthenticated: false, error: null })
  },
  updateProfile: async (payload) => {
    const { user } = get()
    if (!user) return null

    set({ loading: true, error: null })
    try {
      const { user: updatedUser } = await updateUserProfile(payload)
      setToken(updatedUser.token)
      set({ user: updatedUser, isAuthenticated: true })
      return updatedUser
    } catch (error) {
      set({ error: formatError(error) })
      return null
    } finally {
      set({ loading: false })
    }
  },
}))
