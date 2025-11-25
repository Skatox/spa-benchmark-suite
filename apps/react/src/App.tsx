import { Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import ArticlePage from './pages/ArticlePage'
import EditorPage from './pages/EditorPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import SettingsPage from './pages/SettingsPage'
import { useEffect } from 'react'
import { useAuthStore } from './stores/authStore'

const RequireAuth = () => {
  const { isAuthenticated, loading, bootstrapped } = useAuthStore()
  const location = useLocation()

  if (!bootstrapped || loading)
    return <p className="helper-text" style={{ padding: '1rem' }}>Loading...</p>
  if (!isAuthenticated) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} />
  return <Outlet />
}

const NavBar = () => {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path
  const isEditorActive = location.pathname.startsWith('/editor')
  const isProfileActive = user && location.pathname.startsWith(`/profile/${user.username}`)

  return (
    <header className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="navbar-logo">
          conduit
        </Link>
        <nav className="navbar-links">
          <Link className={`navbar-link ${isActive('/') ? 'active' : ''}`} to="/">
            Home
          </Link>
          {isAuthenticated ? (
            <>
              <Link className={`navbar-link ${isEditorActive ? 'active' : ''}`} to="/editor">
                New Article
              </Link>
              <Link className={`navbar-link ${isActive('/settings') ? 'active' : ''}`} to="/settings">
                Settings
              </Link>
              <button
                type="button"
                className={`navbar-link navbar-button ${isProfileActive ? 'active' : ''}`}
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
              >
                Logout
              </button>
              <Link
                className={`navbar-link ${isProfileActive ? 'active' : ''}`}
                to={`/profile/${user?.username}`}
              >
                {user?.username}
              </Link>
            </>
          ) : (
            <>
              <Link className={`navbar-link ${isActive('/login') ? 'active' : ''}`} to="/login">
                Sign in
              </Link>
              <Link className={`navbar-link ${isActive('/register') ? 'active' : ''}`} to="/register">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

function App() {
  const bootstrap = useAuthStore((state) => state.bootstrap)

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  return (
    <div>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/article/:slug" element={<ArticlePage />} />
        <Route element={<RequireAuth />}>
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/editor/:slug" element={<EditorPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/profile/:username/favorites" element={<ProfilePage />} />
      </Routes>
    </div>
  )
}

export default App
