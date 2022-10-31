import Home from "../../views/Home.vue";

export const router = {
    path: "/visitor",
    name: "Visitor",
    component: Home,
    children: [
        {
            path: "/visitor_list",
            name: "VisitorList",
            meta: {
                title: '访客',
                icon: "el-icon-user",

            },
            component: () => import ( /* webpackChunkName: "dashboard" */ "@/views/visitor/VisitorList.vue")
        },
    ]
}
