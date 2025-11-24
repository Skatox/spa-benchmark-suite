import { derived, get, writable } from 'svelte/store'
import { auth as authApi } from '../services/api'

const storedUser = typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null
const storedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || '',
  loading: false,
  error: null,
  bootstrapped: false
}

const persistSession = (user, token) => {
  if (typeof localStorage === 'undefined') return
  if (user) localStorage.setItem('user', JSON.stringify(user))
  else localStorage.removeItem('user')

  if (token) localStorage.setItem('token', token)
  else localStorage.removeItem('token')
}

const normalizeError = (err) => {
  if (!err) return { message: 'Request failed' }
  if (err.errors) return err.errors
  if (err.message) return { message: err.message }
  return { message: 'Request failed' }
}

function createAuthStore() {
  const store = writable(initialState)
  const setState = (patch) => store.update((state) => ({ ...state, ...patch }))

  const setSession = (user) => {
    const token = user?.token ?? ''
    persistSession(user, token)
    store.set({ user, token, loading: false, error: null, bootstrapped: true })
  }

  const clearSession = () => {
    persistSession(null, '')
    store.set({ ...initialState, bootstrapped: true })
  }

  return {
    subscribe: store.subscribe,
    bootstrap: async () => {
      const state = get(store)
      if (state.bootstrapped) return

      if (!state.token) {
        setState({ bootstrapped: true })
        return
      }

      setState({ loading: true, error: null })
      try {
        const response = await authApi.current(state.token)
        setSession(response.user)
      } catch (error) {
        clearSession()
        setState({ error: normalizeError(error) })
      } finally {
        setState({ loading: false, bootstrapped: true })
      }
    },
    login: async (email, password) => {
      setState({ loading: true, error: null })
      try {
        const response = await authApi.login(email, password)
        setSession(response.user)
        return response.user
      } catch (error) {
        const normalized = normalizeError(error)
        setState({ error: normalized, loading: false, bootstrapped: true })
        throw normalized
      } finally {
        setState({ loading: false })
      }
    },
    register: async (username, email, password) => {
      setState({ loading: true, error: null })
      try {
        const response = await authApi.register(username, email, password)
        setSession(response.user)
        return response.user
      } catch (error) {
        const normalized = normalizeError(error)
        setState({ error: normalized, loading: false, bootstrapped: true })
        throw normalized
      } finally {
        setState({ loading: false })
      }
    },
    updateProfile: async (payload) => {
      const state = get(store)
      if (!state.token) throw new Error('Missing session token')

      const response = await authApi.update(state.token, payload)
      setSession(response.user)
      return response.user
    },
    logout: () => {
      clearSession()
    }
  }
}

export const authStore = createAuthStore()
export const isAuthenticated = derived(authStore, ($store) => Boolean($store.user))
