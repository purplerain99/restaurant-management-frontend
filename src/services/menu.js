import api from './api'

export const getMenuItems =
    async (
        params = {}
    ) => {

        const response =
            await api.get(
                '/menu-items',
                {
                    params,
                }
            )

        return response.data
    }


export const createMenuItem =
    async (
        formData
    ) => {

        const response =
            await api.post(
                '/menu-items',
                formData,
                {
                    headers: {
                        'Content-Type':
                            'multipart/form-data',
                    },
                }
            )

        return response.data
    }


export const updateMenuItem =
    async (
        id,
        formData
    ) => {

        // formData.append(
        //     '_method',
        //     'PUT'
        // )

        const response =
            await api.post(
                `/menu-items/${id}`,
                formData,
                {
                    headers: {
                        'Content-Type':
                            'multipart/form-data',
                    },
                }
            )

        return response.data
    }


export const deleteMenuItem =
    async (
        id
    ) => {

        const response =
            await api.delete(
                `/menu-items/${id}`
            )

        return response.data
    }


// For Customer Menu => Categories
export const getPublicCategories =
    async () => {

        const response =
            await api.get(
                'public/categories'
            )

        return response.data
    }


export const getPublicMenuItems = (
    params = {}
) => {
    return api.get(
        "/public/menu-items",
        {
            params,
        }
    );
};