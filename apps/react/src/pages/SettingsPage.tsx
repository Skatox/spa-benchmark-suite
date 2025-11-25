import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

const SettingsPage = () => {
  const user = useAuthStore((state) => state.user)
  const updateProfile = useAuthStore((state) => state.updateProfile)
  const logout = useAuthStore((state) => state.logout)
  const loading = useAuthStore((state) => state.loading)
  const error = useAuthStore((state) => state.error)
  const navigate = useNavigate()

  const [image, setImage] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (!user) return
    setImage(user.image ?? '')
    setUsername(user.username)
    setBio(user.bio ?? '')
    setEmail(user.email)
  }, [user])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const updated = await updateProfile({ image, username, bio, email, password: password || undefined })
    if (updated) {
      navigate(`/profile/${updated.username}`)
    }
  }

  return (
    <main className="container" style={{ maxWidth: '700px', padding: '2rem 0' }}>
      <div className="card">
        <header className="page-header">
          <h1>Your settings</h1>
        </header>
        {error && <p className="error-text">{error}</p>}
        <form className="form" onSubmit={handleSubmit}>
          <label className="form-group">
            Profile picture URL
            <input value={image} onChange={(e) => setImage(e.target.value)} />
          </label>
          <label className="form-group">
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />
          </label>
          <label className="form-group">
            Bio
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="textarea" rows={4} />
          </label>
          <label className="form-group">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="form-group">
            New password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current"
            />
          </label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button className="button primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Update settings'}
            </button>
            <button
              className="button danger"
              type="button"
              onClick={() => {
                logout()
                navigate('/login')
              }}
            >
              Logout
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default SettingsPage
