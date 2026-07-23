import { h } from "vue";
import { type Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import Libraries from "./layout/Libraries.vue";
import UnofficialBanner from "./layout/UnofficialBanner.vue";
import "./style.css";

export default {
    extends: DefaultTheme,
    Layout: () => {
        return h(DefaultTheme.Layout, null, {
            "layout-top": () => h(UnofficialBanner),
        });
    },

    enhanceApp({ app, router, siteData }) {
        app.component("Libraries", Libraries);
    },
} satisfies Theme;
