import { FormEvent, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createArticle, fetchArticle, updateArticle } from '../services/api'

const EditorPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(slug)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [body, setBody] = useState('')
  const [tagList, setTagList] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadArticle = async () => {
      if (!slug) return
      setLoading(true)
      try {
        const { article } = await fetchArticle(slug)
        setTitle(article.title)
        setDescription(article.description)
        setBody(article.body)
        setTagList(article.tagList.join(', '))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load article')
      } finally {
        setLoading(false)
      }
    }

    loadArticle()
  }, [slug])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload = {
        title,
        description,
        body,
        tagList: tagList
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      }

      const { article } = isEditing && slug ? await updateArticle(slug, payload) : await createArticle(payload)
      navigate(`/article/${article.slug}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save article')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container" style={{ maxWidth: '800px' }}>
      <div className="card">
        <header className="page-header">
          <h1>{isEditing ? 'Edit article' : 'New article'}</h1>
        </header>
        {error && <p className="error-text">{error}</p>}
        <form className="form" onSubmit={handleSubmit}>
          <label className="form-group">
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label className="form-group">
            Description
            <input value={description} onChange={(e) => setDescription(e.target.value)} required />
          </label>
          <label className="form-group">
            Body
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="textarea"
              rows={10}
              required
            />
          </label>
          <label className="form-group">
            Tags (comma separated)
            <input value={tagList} onChange={(e) => setTagList(e.target.value)} />
          </label>
          <button className="button primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Publish article'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default EditorPage
