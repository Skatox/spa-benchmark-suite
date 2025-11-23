import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ArticlePreview from '../components/ArticlePreview'
import { favoriteArticle, fetchArticles, fetchTags, fetchUserFeed, type Article } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

type FeedType = 'global' | 'personal' | 'tag'

const HomePage = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [feedType, setFeedType] = useState<FeedType>('global')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const heading = useMemo(() => {
    if (feedType === 'personal') return 'Your feed'
    if (feedType === 'tag' && selectedTag) return `#${selectedTag}`
    return 'Global feed'
  }, [feedType, selectedTag])

  useEffect(() => {
    const loadTags = async () => {
      const { tags: popularTags } = await fetchTags()
      setTags(popularTags)
    }
    loadTags()
  }, [])

  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true)
      setError(null)
      try {
        if (feedType === 'personal') {
          const { articles: feed } = await fetchUserFeed({ limit: 10, offset: 0 })
          setArticles(feed)
          return
        }

        const params: Record<string, string | number | undefined> = {
          limit: 10,
          offset: 0,
        }

        if (feedType === 'tag' && selectedTag) {
          params.tag = selectedTag
        }

        const { articles: list } = await fetchArticles(params)
        setArticles(list)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load articles')
      } finally {
        setLoading(false)
      }
    }

    loadArticles()
  }, [feedType, selectedTag])

  const setFeed = (type: FeedType, tag?: string) => {
    if (type === 'personal' && !isAuthenticated) {
      navigate({ pathname: '/login', search: '?redirect=/' })
      return
    }
    setFeedType(type)
    setSelectedTag(tag ?? null)
  }

  const handleFavorite = async (article: Article) => {
    if (!isAuthenticated) {
      navigate({ pathname: '/login', search: '?redirect=/' })
      return
    }

    try {
      const { article: updated } = await favoriteArticle(article.slug, article.favorited)
      setArticles((prev) => prev.map((item) => (item.slug === article.slug ? updated : item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update favorite')
    }
  }

  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1 style={{ margin: 0 }}>conduit</h1>
          <p className="helper-text" style={{ color: '#e6ffe6' }}>
            A place to share your knowledge.
          </p>
        </div>
      </section>

      <section className="container" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div>
          <div className="feed-toggle">
            <button className={feedType === 'global' ? 'active' : ''} onClick={() => setFeed('global')}>
              Global feed
            </button>
            <button className={feedType === 'personal' ? 'active' : ''} onClick={() => setFeed('personal')}>
              Your feed
            </button>
            {selectedTag ? (
              <button className={feedType === 'tag' ? 'active' : ''} onClick={() => setFeed('tag')}>
                #{selectedTag}
              </button>
            ) : null}
          </div>

          <div className="card" style={{ padding: '0 1rem' }}>
            <header className="page-header">
              <h2 style={{ margin: '1rem 0' }}>{heading}</h2>
            </header>

            {error && <p className="error-text">{error}</p>}
            {!error && loading && <p className="helper-text">Loading articles...</p>}
            {!error && !loading && (
              <>
                {articles.map((article) => (
                  <ArticlePreview key={article.slug} article={article} onToggleFavorite={handleFavorite} />
                ))}
                {!articles.length && <p className="empty-state">No articles are here yet.</p>}
              </>
            )}
          </div>
        </div>

        <aside className="card">
          <h3 style={{ marginTop: 0 }}>Popular tags</h3>
          <div className="tag-list">
            {tags.map((tag) => (
              <button
                key={tag}
                className="tag-pill"
                style={{ border: 'none', cursor: 'pointer' }}
                onClick={() => setFeed('tag', tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </aside>
      </section>
    </div>
  )
}

export default HomePage
