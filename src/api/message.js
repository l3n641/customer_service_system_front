import request from '@/utils/request'

export function sendMessage(data) {
    return request({
        url: '/message',
        method: 'post',
        data
    })
}
export function getMessage(params) {
    return request({
        url: '/message',
        method: 'get',
        params
    })
}