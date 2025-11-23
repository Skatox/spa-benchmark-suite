import Home from './pages/Home.svelte'
import Login from './pages/Login.svelte'
import Register from './pages/Register.svelte'
import Settings from './pages/Settings.svelte'
import Editor from './pages/Editor.svelte'
import Article from './pages/Article.svelte'
import Profile from './pages/Profile.svelte'

const routes = {
  '/': Home,
  '/login': Login,
  '/register': Register,
  '/settings': Settings,
  '/editor': Editor,
  '/editor/:slug': Editor,
  '/article/:slug': Article,
  '/profile/:username': Profile,
  '/profile/:username/favorites': Profile
}

export default routes
