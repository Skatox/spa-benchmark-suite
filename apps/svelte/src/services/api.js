const API_URL = import.meta.env.VITE_API_URL ?? '/api'

function getHeaders(token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Token ${token}`
  return headers
}

async function request(path, method = 'GET', body, token) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: getHeaders(token),
    body: body ? JSON.stringify(body) : undefined
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw error.errors || error || { message: 'Request failed' }
  }

  return res.json()
}

export const auth = {
  login: (email, password) => request('/users/login', 'POST', { user: { email, password } }),
  register: (username, email, password) => request('/users', 'POST', { user: { username, email, password } }),
  current: (token) => request('/user', 'GET', null, token),
  update: (token, user) => request('/user', 'PUT', { user }, token)
}

export const articles = {
  list: (params = {}, token) => request(`/articles${buildQuery(params)}`, 'GET', null, token),
  feed: (params = {}, token) => request(`/articles/feed${buildQuery(params)}`, 'GET', null, token),
  get: (slug, token) => request(`/articles/${slug}`, 'GET', null, token),
  create: (token, article) => request('/articles', 'POST', { article }, token),
  update: (token, slug, article) => request(`/articles/${slug}`, 'PUT', { article }, token),
  delete: (token, slug) => request(`/articles/${slug}`, 'DELETE', null, token),
  favorite: (token, slug) => request(`/articles/${slug}/favorite`, 'POST', null, token),
  unfavorite: (token, slug) => request(`/articles/${slug}/favorite`, 'DELETE', null, token)
}

export const profiles = {
  get: (username, token) => request(`/profiles/${username}`, 'GET', null, token),
  follow: (token, username) => request(`/profiles/${username}/follow`, 'POST', null, token),
  unfollow: (token, username) => request(`/profiles/${username}/follow`, 'DELETE', null, token)
}

export const comments = {
  list: (slug, token) => request(`/articles/${slug}/comments`, 'GET', null, token),
  create: (token, slug, body) => request(`/articles/${slug}/comments`, 'POST', { comment: { body } }, token),
  delete: (token, slug, id) => request(`/articles/${slug}/comments/${id}`, 'DELETE', null, token)
}

export const tags = {
  all: () => request('/tags')
}

function buildQuery(params) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) search.append(key, value)
  })
  const query = search.toString()
  return query ? `?${query}` : ''
}
