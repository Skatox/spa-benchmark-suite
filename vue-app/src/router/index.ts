import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

import AboutRoute from '../routes/About.vue';
import DashboardRoute from '../routes/Dashboard.vue';
import ItemDetailRoute from '../routes/ItemDetail.vue';
import ItemFormRoute from '../routes/ItemForm.vue';
import ItemsRoute from '../routes/Items.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', component: DashboardRoute },
  { path: '/items', component: ItemsRoute },
  { path: '/items/new', component: ItemFormRoute, props: { mode: 'create' } },
  { path: '/items/:id', component: ItemDetailRoute },
  { path: '/items/:id/edit', component: ItemFormRoute, props: { mode: 'edit' } },
  { path: '/about', component: AboutRoute },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
