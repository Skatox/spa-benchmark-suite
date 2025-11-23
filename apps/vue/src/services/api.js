import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.realworld.io/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('realworld_token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

function formatErrors(error) {
  if (error.response?.data?.errors) {
    return Object.entries(error.response.data.errors).flatMap(([field, messages]) =>
      messages.map((msg) => `${field} ${msg}`),
    );
  }
  return [error.message];
}

export default {
  get: (...args) => api.get(...args),
  post: (...args) => api.post(...args),
  put: (...args) => api.put(...args),
  delete: (...args) => api.delete(...args),
  formatErrors,
  async getArticles(params) {
    const { data } = await api.get('/articles', { params });
    return data;
  },
  async getFeed(params) {
    const { data } = await api.get('/articles/feed', { params });
    return data;
  },
  async getArticle(slug) {
    const { data } = await api.get(`/articles/${slug}`);
    return data.article;
  },
  async createArticle(article) {
    const { data } = await api.post('/articles', { article });
    return data.article;
  },
  async updateArticle(slug, article) {
    const { data } = await api.put(`/articles/${slug}`, { article });
    return data.article;
  },
  async deleteArticle(slug) {
    return api.delete(`/articles/${slug}`);
  },
  async getTags() {
    const { data } = await api.get('/tags');
    return data.tags;
  },
  async favoriteArticle(slug) {
    const { data } = await api.post(`/articles/${slug}/favorite`);
    return data.article;
  },
  async unfavoriteArticle(slug) {
    const { data } = await api.delete(`/articles/${slug}/favorite`);
    return data.article;
  },
  async getComments(slug) {
    const { data } = await api.get(`/articles/${slug}/comments`);
    return data.comments;
  },
  async addComment(slug, body) {
    const { data } = await api.post(`/articles/${slug}/comments`, { comment: { body } });
    return data.comment;
  },
  async deleteComment(slug, id) {
    return api.delete(`/articles/${slug}/comments/${id}`);
  },
  async getProfile(username) {
    const { data } = await api.get(`/profiles/${username}`);
    return data.profile;
  },
  async follow(username) {
    const { data } = await api.post(`/profiles/${username}/follow`);
    return data.profile;
  },
  async unfollow(username) {
    const { data } = await api.delete(`/profiles/${username}/follow`);
    return data.profile;
  },
};
