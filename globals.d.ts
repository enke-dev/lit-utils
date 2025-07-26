declare module 'vitepress-plugin-search' {
  import type { IndexOptions } from 'flexsearch';
  import type { Plugin } from 'vite';

  interface SearchOptions extends IndexOptions<unknown> {
    previewLength: number;
    buttonLabel: string;
    placeholder: string;
    allow: string[];
    ignore: string[];
  }

  export function SearchPlugin(options?: Partial<SearchOptions>): Plugin;
}
