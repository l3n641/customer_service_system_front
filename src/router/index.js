import { createRouter, createWebHashHistory } from "vue-router";
import { router as loginRouter } from "./login";
import { router as homeRouter } from "./home";
import Home from "/src/views/Home.vue";

const routes = [
    {
        path: '/user',
        name: 'user',
        component: Home,
        meta: { title: '个人中心', icon: 'el-icon-shopping-cart-full' },
        children: [
            {
                path: '/user',
                name: 'user',
                meta: {
                    title: '个人中心'
                },
                component: () => import (/* webpackChunkName: "user" */ '@/views/User.vue')
            },
        ]
    },
    loginRouter,
    homeRouter,
    {
        path: '/403',
        name: '403',
        meta: {
            title: '没有权限'
        },
        component: () => import (/* webpackChunkName: "403" */ '@/views/403.vue')
    },
    {
        path: '/404',
        name: '404',
        meta: {
            title: '找不到页面'
        },
        component: () => import (/* webpackChunkName: "404" */ '@/views/404.vue')
    },
    {
        path: "/:catchAll(.*)", // 不识别的path自动匹配404
        redirect: '/404',
        hidden: true
    }

];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});


export default router;
