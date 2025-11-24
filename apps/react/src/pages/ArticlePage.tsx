import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ArticlePreview from '../components/ArticlePreview'
import {
  addComment,
  deleteArticle,
  deleteComment,
  favoriteArticle,
  fetchArticle,
  fetchComments,
  followUser,
  type Article,
  type Comment,
} from '../services/api'
import { useAuthStore } from '../stores/authStore'

const ArticlePage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const [article, setArticle] = useState<Article | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isOwner = useMemo(
    () => Boolean(user && article && user.username === article.author.username),
    [article, user]
  )

  useEffect(() => {
    const loadArticle = async () => {
      if (!slug) return
      setLoading(true)
      setError(null)
      try {
        const [{ article: loaded }, { comments: loadedComments }] = await Promise.all([
          fetchArticle(slug),
          fetchComments(slug),
        ])
        setArticle(loaded)
        setComments(loadedComments)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load article')
      } finally {
        setLoading(false)
      }
    }

    loadArticle()
  }, [slug])

  const requireAuth = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/article/${slug}`)
      return false
    }
    return true
  }

  const toggleFavorite = async () => {
    if (!article || !requireAuth()) return
    const { article: updated } = await favoriteArticle(article.slug, article.favorited)
    setArticle(updated)
  }

  const toggleFollow = async () => {
    if (!article || !requireAuth()) return
    const { profile } = await followUser(article.author.username, article.author.following)
    setArticle({ ...article, author: profile })
  }

  const submitComment = async (event: FormEvent) => {
    event.preventDefault()
    if (!article || !requireAuth()) return
    if (!commentText.trim()) return

    const { comment } = await addComment(article.slug, commentText)
    setComments((prev) => [comment, ...prev])
    setCommentText('')
  }

  const removeComment = async (commentId: number) => {
    if (!article) return
    await deleteComment(article.slug, commentId)
    setComments((prev) => prev.filter((comment) => comment.id !== commentId))
  }

  const removeArticle = async () => {
    if (!article) return
    await deleteArticle(article.slug)
    navigate('/')
  }

  return (
    <section className="container" style={{ padding: '2rem 0' }}>
      {error && <p className="error-text">{error}</p>}
      {!error && loading && <p className="helper-text">Loading article...</p>}

      {!loading && article && (
        <>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="page-header">
              <div>
                <h1 style={{ margin: 0 }}>{article.title}</h1>
                <p className="helper-text">{new Date(article.createdAt).toLocaleString()}</p>
              </div>
              <div className="article-actions">
                <button className="button secondary" type="button" onClick={toggleFollow}>
                  {article.author.following ? 'Unfollow' : 'Follow'} {article.author.username}
                </button>
                <button className="button secondary" type="button" onClick={toggleFavorite}>
                  ❤ {article.favoritesCount}
                </button>
                {isOwner && (
                  <>
                    <button className="button primary" type="button" onClick={() => navigate(`/editor/${article.slug}`)}>
                      Edit
                    </button>
                    <button className="button danger" type="button" onClick={removeArticle}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
            <p style={{ whiteSpace: 'pre-wrap' }}>{article.body}</p>
            <div className="tag-list">
              {article.tagList.map((tag) => (
                <span key={tag} className="tag-pill">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <section className="card" style={{ marginBottom: '1rem' }}>
            <h3>Comments</h3>
            {isAuthenticated ? (
              <form className="form" onSubmit={submitComment}>
                <label className="form-group" style={{ width: '100%' }}>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="textarea"
                    rows={3}
                    placeholder="Write a comment..."
                  />
                </label>
                <button className="button primary" type="submit">
                  Post comment
                </button>
              </form>
            ) : (
              <div className="helper-text">
                <Link to="/login">Sign in</Link> <span> or </span>
                <Link to="/register">sign up</Link>
                <span> to add comments.</span>
              </div>
            )}

            {comments.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {comments.map((comment) => (
                  <article key={comment.id} className="comment">
                    <div className="comment-header">
                      <div>
                        <strong>{comment.author.username}</strong>
                        <span className="helper-text"> · {new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      {comment.author.username === user?.username && (
                        <button className="button secondary" type="button" onClick={() => removeComment(comment.id)}>
                          Delete
                        </button>
                      )}
                    </div>
                    <p style={{ margin: 0 }}>{comment.body}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="helper-text">No comments yet.</p>
            )}
          </section>

          <section className="card">
            <h3>More from {article.author.username}</h3>
            <ArticlePreview article={article} onToggleFavorite={toggleFavorite} />
          </section>
        </>
      )}
    </section>
  )
}

export default ArticlePage
