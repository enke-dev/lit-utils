import mkcert from 'vite-plugin-mkcert';
import { defineConfig } from 'vitepress';
import { pagefindPlugin } from 'vitepress-plugin-pagefind';

import { name, version } from '../../package.json';
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
  // `transformHtml` can not be used, as it is not picked up in the
  // dev server, see https://github.com/vuejs/vitepress/issues/2537
  transformPageData(pageData) {
    // set app version to hero action on homepage
    if ('hero' in pageData.frontmatter) {
      pageData.frontmatter['hero'].actions.map((action: { text: string; link: string }) => {
        if (action.text === 'View on npm') {
          action.text = `${version} on npm`;
          action.link = `https://www.npmjs.com/package/${name}/v/${version}`;
        }
        return action;
      });
    }
    return pageData;
  },
  vite: {
    plugins: [
      mkcert(),
      pagefindPlugin({
        indexingCommand:
          './node_modules/.bin/pagefind --site docs/.vitepress/dist --output-path docs/.vitepress/dist/pagefind --exclude-selectors "div.aside, a.header-anchor"',
      }),
    ],
  },
});
