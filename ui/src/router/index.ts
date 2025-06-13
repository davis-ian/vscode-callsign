import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

// import ApiExplorer from '@/views/ApiExplorer.vue';
import RouteDetail from '@/views/RouteDetail.vue';
import HistoryView from '@/views/HistoryView.vue';

const routes: RouteRecordRaw[] = [
    // {
    //     path: '/',
    //     redirect: '/history',
    // },
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
