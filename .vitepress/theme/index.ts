// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import { type Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import Libraries from "./layout/Libraries.vue";
import UnofficialBanner from "./layout/UnofficialBanner.vue";
import { enhanceAppWithTabs } from "vitepress-plugin-tabs/client";
import "./style.css";
import "./alerts.css";

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      "layout-top": () => h(UnofficialBanner),
    });
  },
  enhanceApp({ app, router, siteData }) {
    app.component("Libraries", Libraries);
    enhanceAppWithTabs(app);
  },
} satisfies Theme;
