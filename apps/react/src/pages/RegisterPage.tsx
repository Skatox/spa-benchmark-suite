import { FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

const RegisterPage = () => {
  const register = useAuthStore((state) => state.register)
  const error = useAuthStore((state) => state.error)
  const loading = useAuthStore((state) => state.loading)
  const navigate = useNavigate()
  const location = useLocation()
  const redirect = new URLSearchParams(location.search).get('redirect') || '/'

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const user = await register(username, email, password)
    if (user) {
      navigate(redirect)
    }
  }

  return (
    <main className="container" style={{ maxWidth: '600px' }}>
      <div className="card">
        <header className="page-header">
          <h1>Sign up</h1>
          <p className="helper-text">
            <Link to="/login">Have an account?</Link>
          </p>
        </header>
        {error && <p className="error-text">{error}</p>}
        <form className="form" onSubmit={handleSubmit}>
          <label className="form-group">
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />
          </label>
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
            {loading ? 'Signing up...' : 'Sign up'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default RegisterPage
