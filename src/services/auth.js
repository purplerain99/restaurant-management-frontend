import api from './api'


export const login = async (
    email,
    password
) => {

    const response =
        await api.post(
            '/auth/login',
            {
                email,
                password,
            }
        )

    localStorage.setItem(
        'auth_token',
        response.data.data.token
    )

    localStorage.setItem(
        'auth_user',
        JSON.stringify(
            response.data.data.user
        )
    )

    return response.data
}


export const logout = async () => {

    try {

        await api.post(
            '/auth/logout'
        )

    } finally {

        localStorage.removeItem(
            'auth_token'
        )

        localStorage.removeItem(
            'auth_user'
        )
    }
}


export const me = async () => {

    const response =
        await api.get(
            '/auth/me'
        )

    return response.data
}