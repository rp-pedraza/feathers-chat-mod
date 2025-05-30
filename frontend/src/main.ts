import { createPinia } from "pinia";
import piniaPluginPersistedState from "pinia-plugin-persistedstate";
import { createApp } from "vue";
import App from "./App.vue";
import fatalErrorDialog from "./fatal-error-dialog";
import globalErrorHandler from "./global-error-handlers";
import router from "./router";
import { toastPlugin } from "./toast";

const app = createApp(App);
app.use(toastPlugin);
app.use(fatalErrorDialog);
app.use(globalErrorHandler);
app.use(createPinia().use(piniaPluginPersistedState));
app.use(router);
app.mount("#app");
