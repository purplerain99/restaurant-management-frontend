import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const apiBaseUrl = (
    import.meta.env.VITE_APP_API_URL ||
    "http://127.0.0.1:8000/api/v1"
)
    .trim()
    .replace(/\/+$/, "");

const echo = new Echo({
    broadcaster: "reverb",

    key: import.meta.env.VITE_REVERB_APP_KEY,

    wsHost: (
        import.meta.env.VITE_REVERB_HOST ||
        "127.0.0.1"
    ).trim(),

    wsPort: Number(
        import.meta.env.VITE_REVERB_PORT || 8080
    ),

    wssPort: Number(
        import.meta.env.VITE_REVERB_PORT || 8080
    ),

    forceTLS:
        (
            import.meta.env.VITE_REVERB_SCHEME ||
            "http"
        ).trim() === "https",

    enabledTransports: [
        "ws",
        "wss",
    ],

    authEndpoint:
        `${apiBaseUrl}/broadcasting/auth`,

    auth: {
        headers: {
            Accept: "application/json",
            Authorization:
                `Bearer ${localStorage.getItem("token") ||
                localStorage.getItem("token") ||
                ""
                }`,
        },
    },
});

export default echo;