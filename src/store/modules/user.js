import {login, logout, getInfo} from '@/api/user'
import {getToken, setToken, removeToken} from '@/utils/auth'

const getDefaultState = () => {
    return {
        token: getToken(),
        name: '',
        id: null,
        role: null
    }
}

const state = getDefaultState()

const mutations = {
    RESET_STATE: (state) => {
        Object.assign(state, getDefaultState())
    },
    SET_TOKEN: (state, token) => {
        state.token = token
    },
    SET_NAME: (state, name) => {
        state.name = name
    },
    SET_USER_ID: (state, userId) => {
        state.id = userId
    },
    SET_USER_ROLE: (state, role) => {
        state.role = role
    }
}

const actions = {
    // user login
    login({commit}, userInfo) {
        const {username, password} = userInfo
        return new Promise((resolve, reject) => {
            login({name: username.trim(), password: password}).then(response => {
                const data = response
                commit('SET_TOKEN', data.token)
                setToken(data.token)
                resolve(data)
            }).catch(error => {
                reject(error)
            })
        })
    },

    // get user info
    getInfo({commit, state}) {
        return new Promise((resolve, reject) => {
            getInfo().then(response => {
                const data = response

                if (!data) {
                    return reject('Verification failed, please Login again.')
                }

                const {name, id, role} = data
                commit('SET_NAME', name)
                commit('SET_USER_ID', id)
                commit('SET_USER_ROLE', role)
                resolve(data)
            }).catch(error => {
                reject(error)
            })
        })
    },

    // user logout
    logout({commit, state}) {
        return new Promise((resolve, reject) => {
            logout(state.token).then(() => {
                removeToken() // must remove  token  first
                commit('RESET_STATE')
                resolve()
            }).catch(error => {
                reject(error)
            })
        })
    },

    // remove token
    resetToken({commit}) {
        return new Promise(resolve => {
            removeToken() // must remove  token  first
            commit('RESET_STATE')
            resolve()
        })
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}

