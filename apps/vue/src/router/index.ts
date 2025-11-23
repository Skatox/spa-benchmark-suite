import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ArticleView from '../views/ArticleView.vue'
import EditorView from '../views/EditorView.vue'
import ProfileView from '../views/ProfileView.vue'
import SettingsView from '../views/SettingsView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/article/:slug', name: 'article', component: ArticleView, props: true },
    { path: '/editor', name: 'editor', component: EditorView, meta: { requiresAuth: true } },
    {
      path: '/editor/:slug',
      name: 'edit-article',
      component: EditorView,
      props: true,
      meta: { requiresAuth: true },
    },
    { path: '/profile/:username', name: 'profile', component: ProfileView, props: true },
    { path: '/profile/:username/favorites', name: 'profile-favorites', component: ProfileView, props: true },
    { path: '/settings', name: 'settings', component: SettingsView, meta: { requiresAuth: true } },
  ],
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  if (!authStore.user && !authStore.loading) {
    await authStore.bootstrap()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
