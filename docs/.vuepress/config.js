module.exports = {
    base: "/undo-redo-vuex/",
    title: "Undo/Redo Vuex",
    description: "A Vuex plugin for module namespaced undo and redo functionality.",
    theme: require.resolve("@factorial/vuepress-theme"),
    themeConfig: {
        repo: "factorial-io/undo-redo-vuex",
        editLinks: true,
        editLinkText: "Help us improve this page!",
        sidebarDepth: 0,
        displayAllHeaders: true,
        docsDir: "docs",
        sidebar: "auto",
        nav: [
            {
                text: "Guide",
                items: [
                    {
                        text: "Installation",
                        link: "/guide/installation/"
                    },
                    {
                        text: "Usage",
                        link: "/guide/usage/"
                    },
                    {
                        text: "Testing",
                        link: "/guide/testing/"
                    },
                    {
                        text: "Demo",
                        link: "/guide/demo/"
                    }
                ]
            },
            {
                text: "API",
                link: "/api/"
            }
        ]
    }
};