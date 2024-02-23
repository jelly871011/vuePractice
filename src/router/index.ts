/* eslint-disable no-tabs */
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomePage.vue';
import AboutView from '../views/UsersPage.vue';

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: HomeView,
		},
		{
			path: '/users',
			name: 'users',
			component: AboutView,
		},
	],
});

export default router;
