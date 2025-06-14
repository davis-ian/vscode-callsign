import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

// import ApiExplorer from '@/views/ApiExplorer.vue';
import RouteDetail from '@/views/RouteDetail.vue';
import HistoryView from '@/views/HistoryView.vue';
import HomeView from '@/views/HomeView.vue';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Home',
        component: HomeView,
        // redirect: '/history',
    },
    {
        path: '/route',
        name: 'RouteDetail',
        component: RouteDetail,
        props: true,
    },
    {
        path: '/history',
        name: 'History',
        component: HistoryView,
    },
    {
        path: '/codegen',
        name: 'CodeGen',
        component: () => import('@/views/CodeGenView.vue'),
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;
