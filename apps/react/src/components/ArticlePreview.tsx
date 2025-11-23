import { Link } from 'react-router-dom'
import type { Article } from '../services/api'

type Props = {
  article: Article
  onToggleFavorite?: (article: Article) => void
}

const ArticlePreview = ({ article, onToggleFavorite }: Props) => {
  const formattedDate = new Date(article.createdAt).toLocaleDateString()

  return (
    <article className="article-preview">
      <div className="flex-between">
        <div className="article-meta">
          <Link to={`/profile/${article.author.username}`}>
            <img src={article.author.image || 'https://static.productionready.io/images/smiley-cyrus.jpg'} alt="author" />
          </Link>
          <div>
            <Link to={`/profile/${article.author.username}`}>
              <strong>{article.author.username}</strong>
            </Link>
            <div>{formattedDate}</div>
          </div>
        </div>
        <button className="button secondary" type="button" onClick={() => onToggleFavorite?.(article)}>
          ❤ {article.favoritesCount}
        </button>
      </div>
      <Link to={`/article/${article.slug}`}>
        <h3 style={{ marginBottom: '0.35rem' }}>{article.title}</h3>
        <p className="helper-text" style={{ margin: 0 }}>
          {article.description}
        </p>
      </Link>
      <div className="tag-list" style={{ marginTop: '0.75rem' }}>
        {article.tagList.map((tag) => (
          <span key={tag} className="tag-pill">
            {tag}
          </span>
        ))}
      </div>
    </article>
  )
}

export default ArticlePreview
