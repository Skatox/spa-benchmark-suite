import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import ArticlePreview from '../components/ArticlePreview'
import { favoriteArticle, fetchArticles, fetchProfile, followUser, type Article, type Profile } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const ProfilePage = () => {
  const { username } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const showingFavorites = useMemo(() => location.pathname.endsWith('/favorites'), [location.pathname])
  const isCurrentUser = useMemo(() => user?.username === username, [user, username])

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) return
      const { profile: userProfile } = await fetchProfile(username)
      setProfile(userProfile)
    }

    loadProfile()
  }, [username])

  useEffect(() => {
    const loadArticles = async () => {
      if (!username) return
      setLoading(true)
      setError(null)
      try {
        const params = showingFavorites
          ? { favorited: username, limit: 10, offset: 0 }
          : { author: username, limit: 10, offset: 0 }
        const { articles: list } = await fetchArticles(params)
        setArticles(list)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load articles')
      } finally {
        setLoading(false)
      }
    }

    loadArticles()
  }, [showingFavorites, username])

  const toggleFollow = async () => {
    if (!isAuthenticated || !profile) {
      navigate(`/login?redirect=${location.pathname}`)
      return
    }
    const { profile: updated } = await followUser(profile.username, profile.following)
    setProfile(updated)
  }

  const handleFavorite = async (article: Article) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${location.pathname}`)
      return
    }
    const { article: updated } = await favoriteArticle(article.slug, article.favorited)
    setArticles((prev) => prev.map((item) => (item.slug === article.slug ? updated : item)))
  }

  return (
    <section className="container" style={{ padding: '2rem 0' }}>
      {error && <p className="error-text">{error}</p>}

      {profile && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="page-header">
            <div className="flex-between" style={{ width: '100%' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img
                  src={profile.image || 'https://static.productionready.io/images/smiley-cyrus.jpg'}
                  alt="Profile"
                  style={{ width: '80px', height: '80px', borderRadius: '50%' }}
                />
                <div>
                  <h2 style={{ margin: 0 }}>{profile.username}</h2>
                  <p className="helper-text" style={{ margin: 0 }}>
                    {profile.bio}
                  </p>
                </div>
              </div>
              <div>
                {isCurrentUser ? (
                  <Link className="button secondary" to="/settings">
                    Edit profile settings
                  </Link>
                ) : (
                  <button className="button secondary" type="button" onClick={toggleFollow}>
                    {profile.following ? 'Unfollow' : 'Follow'} {profile.username}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="feed-toggle" style={{ marginBottom: 0 }}>
          <Link className={`navbar-link ${!showingFavorites ? 'active' : ''}`} to={`/profile/${username}`} style={{ padding: 0 }}>
            My articles
          </Link>
          <Link
            className={`navbar-link ${showingFavorites ? 'active' : ''}`}
            to={`/profile/${username}/favorites`}
            style={{ padding: 0 }}
          >
            Favorited articles
          </Link>
        </div>

        {loading && <p className="helper-text">Loading articles...</p>}
        {!loading && (
          <>
            {articles.map((article) => (
              <ArticlePreview key={article.slug} article={article} onToggleFavorite={handleFavorite} />
            ))}
            {!articles.length && <p className="empty-state">No articles to display.</p>}
          </>
        )}
      </div>
    </section>
  )
}

export default ProfilePage
