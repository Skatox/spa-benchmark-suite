import { writable } from 'svelte/store'
import { auth as authApi } from '../services/api'

const storedUser = typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null
const storedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null

export const user = writable(storedUser ? JSON.parse(storedUser) : null)
export const token = writable(storedToken || '')
export const loadingUser = writable(false)
export const authError = writable(null)

user.subscribe((value) => {
  if (typeof localStorage === 'undefined') return
  if (value) localStorage.setItem('user', JSON.stringify(value))
  else localStorage.removeItem('user')
})

token.subscribe((value) => {
  if (typeof localStorage === 'undefined') return
  if (value) localStorage.setItem('token', value)
  else localStorage.removeItem('token')
})

export async function loadUser(currentToken) {
  loadingUser.set(true)
  authError.set(null)
  try {
    const response = await authApi.current(currentToken)
    user.set(response.user)
  } catch (err) {
    user.set(null)
    token.set('')
    authError.set(err)
  } finally {
    loadingUser.set(false)
  }
}

export async function login(email, password) {
  loadingUser.set(true)
  authError.set(null)
  try {
    const response = await authApi.login(email, password)
    user.set(response.user)
    token.set(response.user.token)
    return response.user
  } catch (err) {
    authError.set(err)
    throw err
  } finally {
    loadingUser.set(false)
  }
}

export async function register(username, email, password) {
  loadingUser.set(true)
  authError.set(null)
  try {
    const response = await authApi.register(username, email, password)
    user.set(response.user)
    token.set(response.user.token)
    return response.user
  } catch (err) {
    authError.set(err)
    throw err
  } finally {
    loadingUser.set(false)
  }
}

export async function updateUser(currentToken, payload) {
  authError.set(null)
  const response = await authApi.update(currentToken, payload)
  user.set(response.user)
  token.set(response.user.token)
  return response.user
}

export function logout() {
  user.set(null)
  token.set('')
}
