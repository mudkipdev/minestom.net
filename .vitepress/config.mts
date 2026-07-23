import { defineConfig } from "vitepress";
import { withSidebar } from "vitepress-sidebar";
import { redirectsPlugin, writeRedirects } from "./redirects";

const CATEGORY_TITLES: Record<string, string> = {
    "Getting started": "Getting Started",
    "Thread architecture": "Thread Architecture",
};

function normalizeSidebar(items: any[], isCategory = true): void {
    for (const item of items) {
        if (isCategory && item.items) {
            delete item.link;
            item.text = CATEGORY_TITLES[item.text] ?? item.text;
        } else if (typeof item.link === "string") {
            item.link = item.link.replace(/(?:^|\/)index\.md$/, "/");
        }
        if (item.items) normalizeSidebar(item.items, false);
    }
}

const config = withSidebar({
    title: "Minestom",
    description: "The open-source, lightweight Minecraft server built from the ground up..",
    cleanUrls: true,

    head: [
        ["link", { rel: "icon", href: "/favicon.ico" }],
        ["meta", { name: "theme-color", content: "#ff6c32" }],
        ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
        ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
        ["link", {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:wght@400;700&display=swap",
        }],
    ],

    themeConfig: {
        lang: "en",
        logo: "/minestom-logo.png",

        docFooter: {
            prev: false,
            next: false
        },

        search: {
            provider: "local"
        },

        nav: [
            {
                text: "Libraries",
                link: "/libraries"
            },
            {
                text: "Wiki",
                link: "/docs/getting-started/introduction"
            },
            {
                text: "Javadoc",
                link: "https://javadoc.minestom.net"
            },
        ],

        socialLinks: [
            {
                icon: "github",
                link: "https://github.com/Minestom/Minestom",
            },
            {
                icon: "discord",
                link: "https://discord.gg/fpY6kPUkZb",
            },
        ],
    },

    buildEnd(siteConfig) {
        writeRedirects(siteConfig.outDir);
    },

    vite: {
        plugins: [redirectsPlugin()],
    },
}, [{
    documentRootPath: "/",
    scanStartPath: "docs",
    resolvePath: "/docs/",
    useTitleFromFileHeading: true,
    useTitleFromFrontmatter: true,
    useFolderTitleFromIndexFile: true,
    useFolderLinkFromIndexFile: true,
    hyphenToSpace: true,
    capitalizeFirst: true,

    manualSortFileNameByPriority: [
        "getting-started",
        "introduction.md",
        "what-is-minestom.md",
        "when-to-use.md",
        "dependencies.md",
        "your-first-server.md",

        "world",
        "instances.md",
        "chunk-management",
        "anvilloader.md",
        "lighting.md",
        "blocks.md",
        "coordinates.md",
        "generation.md",
        "batch.md",

        "feature",
        "adventure.md",
        "serialization",
        "codecs.md",
        "network-buffers.md",
        "items.md",
        "events.md",
        "player-capabilities.md",
        "entities",
        "ai.md",
        "tags.md",
        "schedulers.md",
        "commands.md",
        "inventories.md",
        "player-uuid.md",
        "player-skin.md",
        "advancements.md",
        "map-rendering.md",
        "locator-bar.md",
        "motd.md",
        "open-to-lan.md",

        "compatibility",
        "proxies.md",
        "unsupported-versions.md",

        "thread-architecture",
        "thread-safety.md",
        "acquirable-api",
        "inside-the-api.md",
    ],
}]);

for (const group of Object.values(config.themeConfig.sidebar as Record<string, any>)) {
    normalizeSidebar(group.items);
}

export default defineConfig(config);