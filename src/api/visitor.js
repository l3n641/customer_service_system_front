import request from '@/utils/request'

export function getVisitorList(params) {
    return request({
        url: '/visitor',
        method: 'get',
        params
    })
}

export function UpdateVisitorStatus(data) {
    return request({
        url: '/visitor_status',
        method: 'put',
        data
    })
}