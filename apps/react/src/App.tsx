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

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Link to="/" className="logo">
          conduit
        </Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          {isAuthenticated ? (
            <>
              <Link to="/editor">New Article</Link>
              <Link to="/settings">Settings</Link>
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
              >
                Logout
              </button>
              <Link to={`/profile/${user?.username}`}>{user?.username}</Link>
            </>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
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
      <footer className="hero" style={{ marginTop: '3rem' }}>
        <div className="container">
          <p>RealWorld implementation built with Vue 3, Vite, and Pinia.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
