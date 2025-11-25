import { render, screen } from '@testing-library/svelte'
import { vi } from 'vitest'
import App from './App.svelte'

const bootstrap = vi.fn()
const mockState = { user: null, token: '', loading: false, error: null, bootstrapped: false }
const subscribe = (run: (value: typeof mockState) => void) => {
  run(mockState)
  return () => {}
}

vi.mock('./stores/auth', () => ({
  authStore: {
    subscribe,
    bootstrap,
    login: vi.fn(),
    register: vi.fn(),
    updateProfile: vi.fn(),
    logout: vi.fn(),
  },
}))

describe('App', () => {
  it('renders public navigation and boots the auth store', () => {
    render(App)

    expect(screen.getByText('conduit')).toBeInTheDocument()
    expect(screen.getByText('Sign in')).toBeInTheDocument()
    expect(screen.getByText('Sign up')).toBeInTheDocument()
    expect(bootstrap).toHaveBeenCalled()
  })
})
