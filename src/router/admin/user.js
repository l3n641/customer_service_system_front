import Home from "../../views/Home.vue";

export const router = {
    path: "/user",
    name: "User",
    component: Home,
    children: [
        {
            path: "/user_list",
            name: "UserList",
            meta: {
                title: '用户',
                icon: "el-icon-user",

            },
            component: () => import ( /* webpackChunkName: "dashboard" */ "@/views/user/UserList.vue")
        },
    ]
}
