import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import SettingsView from '../views/SettingsView.vue';
import EditorView from '../views/EditorView.vue';
import ArticleView from '../views/ArticleView.vue';
import ProfileView from '../views/ProfileView.vue';
import { useAuthStore } from '../store/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/settings', name: 'settings', component: SettingsView, meta: { requiresAuth: true } },
    { path: '/editor', name: 'new-article', component: EditorView, meta: { requiresAuth: true } },
    { path: '/editor/:slug', name: 'edit-article', component: EditorView, meta: { requiresAuth: true } },
    { path: '/article/:slug', name: 'article', component: ArticleView, props: true },
    {
      path: '/profile/:username',
      name: 'profile',
      component: ProfileView,
      props: true,
    },
    {
      path: '/profile/:username/favorites',
      name: 'profile-favorites',
      component: ProfileView,
      props: true,
    },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (auth.hasToken && !auth.user && !auth.loadingUser) {
    await auth.fetchCurrentUser().catch(() => auth.clearAuth());
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  return true;
});

export default router;
