import router from "@/router";

const getSidebarItems = () => {
    let items = []
    const routes = router.getRoutes()
    for (let route of routes) {
        let item = null
        if (!route.children) {
            if (route.meta && route.meta.hidden) {
                continue
            }
            item = {
                icon: route.meta ? route.meta.icon : "",
                title: route.meta ? route.meta.title : "",
                index: route.path,
            }
        } else {
            if (route.children.length > 0) {
                let subItems = []
                for (let subRoute of route.children) {
                    if (subRoute.meta.hidden) {
                        continue
                    }
                    let subItem = {
                        icon: subRoute.meta.icon ? subRoute.meta.icon : "",
                        title: subRoute.meta.title ? subRoute.meta.title : "",
                        index: subRoute.path,
                    }
                    subItems.push(subItem)
                }

                if (subItems.length === 0) {
                    continue
                } else if (subItems.length === 1) {
                    item = {
                        icon: route.children[0].meta.icon ? route.children[0].meta.icon : "",
                        title: route.children[0].meta.title ? route.children[0].meta.title : "",
                        index: route.children[0].path,
                    }
                } else {
                    item = {
                        icon: route.meta.icon ? route.meta.icon : "",
                        title: route.meta.title ? route.meta.title : "",
                        index: route.path,
                        subs: subItems,
                    }
                }

            }
        }
        if (item) {
            items.push(item)
        }
    }
    return items
}

const state = {
    tagsList: [],
    collapse: false,
    sidebarItems: getSidebarItems()
}
const actions = {}

const mutations = {
    addRoute: (state, data) => {
        for (const item of data) {
            router.addRoute(item)
        }
        router.addRoute({
                path: "/:catchAll(.*)", // 不识别的path自动匹配404
                redirect: '/404',
                meta: {hidden: true}
            }
        )
        state.sidebarItems = getSidebarItems()

    },
    delTagsItem: (state, data) => {
        state
            .tagsList
            .splice(data.index, 1);
    },
    setTagsItem: (state, data) => {
        state
            .tagsList
            .push(data)
    },
    clearTags: (state) => {
        state.tagsList = []
    },
    closeTagsOther: (state, data) => {
        state.tagsList = data;
    },
    closeCurrentTag: (state, data) => {
        for (let i = 0, len = state.tagsList.length; i < len; i++) {
            const item = state.tagsList[i];
            if (item.path === data.$route.fullPath) {
                if (i < len - 1) {
                    data
                        .$router
                        .push(state.tagsList[i + 1].path);
                } else if (i > 0) {
                    data
                        .$router
                        .push(state.tagsList[i - 1].path);
                } else {
                    data
                        .$router
                        .push("/");
                }
                state
                    .tagsList
                    .splice(i, 1);
                break;
            }
        }
    },
    // 侧边栏折叠
    handleCollapse: (state, data) => {
        state.collapse = data;
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}


