import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import { useAuthStore } from "@/stores/auth";

import "./style.css";

const app = createApp(App);

const pinia = createPinia();

app.use(pinia);

const auth = useAuthStore(pinia);

// Auth restore အရင်လုပ်
await auth.restoreAuth;

// Router
app.use(router);

await router.isReady();

// App mount
app.mount("#app");
