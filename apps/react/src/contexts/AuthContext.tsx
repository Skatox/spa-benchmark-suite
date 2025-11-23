import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  clearToken,
  fetchCurrentUser,
  loginUser,
  registerUser,
  setToken,
  updateUserProfile,
  type User,
} from '../services/api'

export type AuthContextValue = {
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  bootstrapped: boolean
  bootstrap: () => Promise<void>
  login: (email: string, password: string) => Promise<User | null>
  register: (username: string, email: string, password: string) => Promise<User | null>
  logout: () => void
  updateProfile: (payload: Partial<User> & { password?: string }) => Promise<User | null>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bootstrapped, setBootstrapped] = useState(false)

  const isAuthenticated = useMemo(() => Boolean(user), [user])

  const bootstrap = async () => {
    if (bootstrapped) return
    setLoading(true)
    const existingToken = localStorage.getItem('realworld_token')
    if (!existingToken) {
      setBootstrapped(true)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { user: currentUser } = await fetchCurrentUser()
      setUser(currentUser)
    } catch (err) {
      console.error('Failed to restore session', err)
      clearToken()
    } finally {
      setBootstrapped(true)
      setLoading(false)
    }
  }

  useEffect(() => {
    bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAuth = async (callback: () => Promise<{ user: User }>) => {
    setLoading(true)
    setError(null)
    try {
      const { user: authenticatedUser } = await callback()
      setToken(authenticatedUser.token)
      setUser(authenticatedUser)
      return authenticatedUser
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unable to authenticate')
      }
      return null
    } finally {
      setLoading(false)
    }
  }

  const login = (email: string, password: string) => handleAuth(() => loginUser(email, password))

  const register = (username: string, email: string, password: string) =>
    handleAuth(() => registerUser(username, email, password))

  const logout = () => {
    setUser(null)
    clearToken()
  }

  const updateProfile = async (payload: Partial<User> & { password?: string }) => {
    if (!user) return null
    setLoading(true)
    setError(null)
    try {
      const { user: updatedUser } = await updateUserProfile(payload)
      setUser(updatedUser)
      setToken(updatedUser.token)
      return updatedUser
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unable to update profile')
      }
      return null
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextValue = {
    user,
    loading,
    error,
    isAuthenticated,
    bootstrapped,
    bootstrap,
    login,
    register,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
