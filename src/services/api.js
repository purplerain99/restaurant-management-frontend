import axios from "axios";

const api = axios.create({
    baseURL:
        import.meta.env.VITE_APP_API_URL ||
        "http://127.0.0.1:8000/api/v1",

    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
    (config) => {
        const token =
            localStorage.getItem("token");

        if (token) {
            config.headers = config.headers || {};

            config.headers.Authorization =
                `Bearer ${token}`;
        }

        config.headers.Accept =
            "application/json";

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);

/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(
    (response) => {
        return response;
    },

    (error) => {
        if (error.response?.status === 401) {
            console.error(
                "401 Unauthorized:",
                error.response?.data
            );

            /*
            |--------------------------------------------------------------------------
            | Token invalid / expired
            |--------------------------------------------------------------------------
            */

            localStorage.removeItem("token");
        }

        return Promise.reject(error);
    }
);

export default api;