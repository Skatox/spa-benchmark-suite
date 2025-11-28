<script>
  export let article
</script>

<div class="article-meta">
  <a href={`/profile/${article.author.username}`}>
    <img src={article.author.image || 'https://static.productionready.io/images/smiley-cyrus.jpg'} alt={article.author.username} />
  </a>
  <div class="info">
    <a href={`/profile/${article.author.username}`} class="author">{article.author.username}</a>
    <span class="date">{new Date(article.createdAt).toDateString()}</span>
  </div>
</div>
