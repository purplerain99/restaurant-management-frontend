import api from './api'

export const createOrder =
    async (data) => {

        const response =
            await api.post(
                '/public/orders',
                data
            )

        return response.data
    }


export const getPublicOrder =
    async (
        orderNumber
    ) => {

        const response =
            await api.get(
                `/public/orders/${orderNumber}`
            )

        return response.data
    }


export const trackOrder =
    async (
        trackingToken
    ) => {

        const response =
            await api.get(
                `/public/orders/track/${trackingToken}`
            )

        return response.data
    }





export const getOrders = (params = {}) => {
    return api.get("/orders", {
        params,
    });
};




export const updateOrderStatus =
    async (
        id,
        status
    ) => {

        const response =
            await api.patch(
                `/orders/${id}/status`,
                {
                    status,
                }
            )

        return response.data
    }

export const getKitchenOrders = (params = {}) => {
    return api.get("/orders", {
        params: {
            ...params,
            kitchen: true,
        },
    });
};