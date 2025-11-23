import { FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const LoginPage = () => {
  const { login, error, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const redirect = searchParams.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const user = await login(email, password)
    if (user) {
      navigate(redirect)
    }
  }

  return (
    <main className="container" style={{ maxWidth: '600px' }}>
      <div className="card">
        <header className="page-header">
          <h1>Sign in</h1>
          <p className="helper-text">
            <Link to="/register">Need an account?</Link>
          </p>
        </header>
        {error && <p className="error-text">{error}</p>}
        <form className="form" onSubmit={handleSubmit}>
          <label className="form-group">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="form-group">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>
          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default LoginPage
