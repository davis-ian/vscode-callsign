import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

import ApiExplorer from '@/views/ApiExplorer.vue';
import HistoryView from '@/views/HistoryView.vue';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/api-explorer',
    },
    {
        path: '/api-explorer',
        name: 'ApiExplorer',
        component: ApiExplorer,
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
