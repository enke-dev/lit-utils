import { defineConfig } from 'vitepress';
import { SearchPlugin } from 'vitepress-plugin-search';

import sidebarItems from '../api/typedoc-sidebar.json';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: '@enke.dev/lit-utils',
  description: 'Custom utils, converters and directives for the lit library.',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    // https://github.com/blakmatrix/vitepress-jsdoc#sidebar-configuration
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/api/' },
    ],
    // sidebar: sidebarItems,
    sidebar: sidebarItems.map(item => ({
      text: item.text[0]?.toLocaleUpperCase() + item.text.slice(1),
      collapsed: item.text === 'utils',
      items:
        item.text !== 'utils'
          ? item.items.flatMap(subItem => subItem.items[0]?.items ?? [])
          : item.items,
    })),
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/enke-dev/lit-utils#readme',
      },
    ],
  },
  vite: {
    plugins: [SearchPlugin()],
  },
});
