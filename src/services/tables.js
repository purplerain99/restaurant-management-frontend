import api from './api'

export const getPublicTable = async (
    tableCode
) => {
    const response = await api.get(
        `/public/tables/${tableCode}`
    )

    return response.data
}

export const getTables = async (params = {}) => {
    const response = await api.get('/tables', {
        params,
    })

    return response.data
}

export const getTable = async (id) => {
    const response = await api.get(`/tables/${id}`)

    return response.data
}

export const createTable = async (data) => {
    const response = await api.post('/tables', data)

    return response.data
}

export const updateTable = async (id, data) => {
    const response = await api.put(`/tables/${id}`, data)

    return response.data
}

export const deleteTable = async (id) => {
    const response = await api.delete(`/tables/${id}`)

    return response.data
}

export const getTableQr = async (id) => {
    const response = await api.get(`/tables/${id}/qr`, {
        responseType: 'blob',
    })

    return response.data
}

