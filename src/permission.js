import router from './router'
import store from './store'
import {ElMessage} from 'element-plus'
import {getToken} from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import {adminRouters} from '@/router/admin/index.js'
import {waiterRoutes} from '@/router/waiter/index.js'

const whiteList = ['/login'] // no redirect whitelist


router.beforeEach(async (to, from, next) => {

    document.title = getPageTitle(to.meta.title)

    // determine whether the user has logged in
    const hasToken = getToken()

    if (hasToken) {
        if (to.path === '/login') {
            // if is logged in, redirect to the home page
            next({path: '/'})
        } else {
            const hasGetUserInfo = store.getters.username
            if (hasGetUserInfo) {

                if (store.getters.userRole == 1) {
                    store.commit('app/addRoute', adminRouters)
                } else {
                    store.commit('app/addRoute', waiterRoutes)
                }

                next()
            } else {
                try {
                    // get user info
                    const user = await store.dispatch('user/getInfo')
                    next({...to, replace: true})

                    if (store.getters.userRole == 1) {
                        store.commit('app/addRoute', adminRouters)
                    } else {
                        store.commit('app/addRoute', waiterRoutes)
                    }

                } catch (error) {
                    // remove token and go to login page to re-login
                    await store.dispatch('user/resetToken')
                    ElMessage.error(error || 'Has Error')
                    next(`/login`)
                }
            }
        }
    } else {
        /* has no token*/
        if (whiteList.indexOf(to.path) !== -1) {
            // in the free login whitelist, go directly
            next()
        } else {
            // other pages that do not have permission to access are redirected to the login page.
            next(`/login?redirect=${to.path}`)
        }
    }
})
router.afterEach(() => {
})
