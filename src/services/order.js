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


export const getOrders =
    async (
        params = {}
    ) => {

        const response =
            await api.get(
                '/orders',
                {
                    params,
                }
            )

        return response.data
    }


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

    export const getKitchenOrders =
    async () => {

        const response =
            await api.get(
                '/orders',
                {
                    params: {
                        kitchen: true,
                    },
                }
            )

        return response.data
    }