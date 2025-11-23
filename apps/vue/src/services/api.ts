const API_URL = 'https://api.realworld.io/api'

export type User = {
  email: string
  token: string
  username: string
  bio: string | null
  image: string | null
}

export type Profile = {
  username: string
  bio: string | null
  image: string | null
  following: boolean
}

export type Article = {
  slug: string
  title: string
  description: string
  body: string
  tagList: string[]
  createdAt: string
  updatedAt: string
  favorited: boolean
  favoritesCount: number
  author: Profile
}

export type Comment = {
  id: number
  body: string
  createdAt: string
  updatedAt: string
  author: Profile
}

export type PaginatedArticles = {
  articles: Article[]
  articlesCount: number
}

const tokenStorageKey = 'realworld_token'

export const getToken = () => localStorage.getItem(tokenStorageKey)

export const setToken = (token: string) => localStorage.setItem(tokenStorageKey, token)

export const clearToken = () => localStorage.removeItem(tokenStorageKey)

const buildHeaders = (needsAuth = false): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (needsAuth) {
    const token = getToken()
    if (token) {
      headers.Authorization = `Token ${token}`
    }
  }

  return headers
}

const handleErrors = async (response: Response) => {
  if (response.ok) return response

  let message = 'Unexpected error while communicating with the API'
  try {
    const data = await response.json()
    if (data?.errors) {
      message = Object.entries<string[]>(data.errors)
        .map(([field, errors]) => `${field} ${errors.join(', ')}`)
        .join('; ')
    }
  } catch (error) {
    if (error instanceof Error) {
      message = error.message
    }
  }

  throw new Error(message)
}

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, options)
  await handleErrors(response)
  const text = await response.text()
  return text ? (JSON.parse(text) as T) : ({} as T)
}

export const loginUser = (email: string, password: string) =>
  request<{ user: User }>(`/users/login`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ user: { email, password } }),
  })

export const registerUser = (username: string, email: string, password: string) =>
  request<{ user: User }>(`/users`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ user: { username, email, password } }),
  })

export const fetchCurrentUser = () =>
  request<{ user: User }>(`/user`, {
    headers: buildHeaders(true),
  })

export const updateUserProfile = (user: Partial<User> & { password?: string }) =>
  request<{ user: User }>(`/user`, {
    method: 'PUT',
    headers: buildHeaders(true),
    body: JSON.stringify({ user }),
  })

export const fetchArticles = (params: Record<string, string | number | boolean | undefined>) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.append(key, String(value))
    }
  })

  return request<PaginatedArticles>(`/articles?${query.toString()}`, {
    headers: buildHeaders(!!getToken()),
  })
}

export const fetchUserFeed = (params: Record<string, string | number | boolean | undefined>) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.append(key, String(value))
    }
  })

  return request<PaginatedArticles>(`/articles/feed?${query.toString()}`, {
    headers: buildHeaders(true),
  })
}

export const fetchArticle = (slug: string) =>
  request<{ article: Article }>(`/articles/${slug}`, {
    headers: buildHeaders(!!getToken()),
  })

export const createArticle = (article: Partial<Article>) =>
  request<{ article: Article }>(`/articles`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify({ article }),
  })

export const updateArticle = (slug: string, article: Partial<Article>) =>
  request<{ article: Article }>(`/articles/${slug}`, {
    method: 'PUT',
    headers: buildHeaders(true),
    body: JSON.stringify({ article }),
  })

export const deleteArticle = (slug: string) =>
  request<void>(`/articles/${slug}`, {
    method: 'DELETE',
    headers: buildHeaders(true),
  })

export const favoriteArticle = (slug: string, favorited: boolean) =>
  request<{ article: Article }>(`/articles/${slug}/favorite`, {
    method: favorited ? 'DELETE' : 'POST',
    headers: buildHeaders(true),
  })

export const fetchTags = () =>
  request<{ tags: string[] }>(`/tags`, {
    headers: buildHeaders(!!getToken()),
  })

export const fetchComments = (slug: string) =>
  request<{ comments: Comment[] }>(`/articles/${slug}/comments`, {
    headers: buildHeaders(!!getToken()),
  })

export const addComment = (slug: string, body: string) =>
  request<{ comment: Comment }>(`/articles/${slug}/comments`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify({ comment: { body } }),
  })

export const deleteComment = (slug: string, commentId: number) =>
  request<void>(`/articles/${slug}/comments/${commentId}`, {
    method: 'DELETE',
    headers: buildHeaders(true),
  })

export const followUser = (username: string, following: boolean) =>
  request<{ profile: Profile }>(`/profiles/${username}/follow`, {
    method: following ? 'DELETE' : 'POST',
    headers: buildHeaders(true),
  })

export const fetchProfile = (username: string) =>
  request<{ profile: Profile }>(`/profiles/${username}`, {
    headers: buildHeaders(!!getToken()),
  })
