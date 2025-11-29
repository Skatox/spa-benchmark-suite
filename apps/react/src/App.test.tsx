import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import App from './App'

const bootstrap = vi.fn()
const logout = vi.fn()

type AuthStoreState = {
  user: null
  loading: boolean
  bootstrapped: boolean
  isAuthenticated: boolean
  bootstrap: () => void
  login: () => void
  register: () => void
  logout: () => void
  updateProfile: () => void
}

vi.mock('./stores/authStore', () => {
  const state: AuthStoreState = {
    user: null,
    loading: false,
    bootstrapped: true,
    isAuthenticated: false,
    bootstrap,
    login: vi.fn(),
    register: vi.fn(),
    logout,
    updateProfile: vi.fn(),
  }

  return {
    useAuthStore: (selector?: (state: AuthStoreState) => unknown) =>
      selector ? selector(state) : state,
  }
})

describe('App', () => {
  it('renders unauthenticated navigation and boots the auth store', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByText(/conduit/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument()
    expect(bootstrap).toHaveBeenCalled()
    expect(logout).not.toHaveBeenCalled()
  })
})
