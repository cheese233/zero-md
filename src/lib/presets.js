const jsdelivr = (/** @type {string} */ repo) => `https://cdn.jsdelivr.net/npm/${repo}`
const link = (/** @type {string} */ href, /** @type {string|undefined} */ attrs) =>
  `<link rel="stylesheet" href="${href}"${attrs ? ` ${attrs}` : ''}>`
const load = async (/** @type {string} */ url, name = 'default') =>
  (await import(/* @vite-ignore */ url))[name]

export const STYLES = {
  HOST: '<style>:host{display:block;position:relative;contain:content;}:host([hidden]){display:none;}</style>',
  MARKDOWN: link(jsdelivr('github-markdown-css@5/github-markdown.min.css')),
  MARKDOWN_LIGHT: link(jsdelivr('github-markdown-css@5/github-markdown-light.min.css')),
  MARKDOWN_DARK: link(jsdelivr('github-markdown-css@5/github-markdown-dark.min.css')),
  KATEX: link(jsdelivr('katex@0/dist/katex.min.css')),
  SHIKI: `
  <style>
    @media (prefers-color-scheme: dark) {
      .shiki,
      .shiki span {
        color: var(--shiki-dark) !important;
        background-color: var(--shiki-dark-bg) !important;
        font-style: var(--shiki-dark-font-style) !important;
        font-weight: var(--shiki-dark-font-weight) !important;
        text-decoration: var(--shiki-dark-text-decoration) !important;
      }
    }
  </style>`,
  preset(theme = '') {
    const { HOST, MARKDOWN, MARKDOWN_LIGHT, MARKDOWN_DARK, KATEX, SHIKI } = this
    const get = (/** @type {string} */ sheets) => `${HOST}${sheets}${KATEX}`
    switch (theme) {
      case 'light':
        return get(MARKDOWN_LIGHT)
      case 'dark':
        return get(MARKDOWN_DARK)
      default:
        return get(MARKDOWN + SHIKI)
    }
  }
}

export const LOADERS = {
  marked: async () => {
    const Marked = await load(jsdelivr('marked@15/lib/marked.esm.js'), 'Marked')
    return new Marked({ async: true })
  },
  markedBaseUrl: () => load(jsdelivr('marked-base-url@1/+esm'), 'baseUrl'),
  markedShiki: () => load(jsdelivr('marked-shiki@1/+esm')),
  markedGfmHeadingId: () => load(jsdelivr('marked-gfm-heading-id@4/+esm'), 'gfmHeadingId'),
  markedAlert: () => load(jsdelivr('marked-alert@2/+esm')),
  shiki: () => import(/* @vite-ignore */ jsdelivr('shiki@1/+esm')),
  mermaid: () => load(jsdelivr('mermaid@11/dist/mermaid.esm.min.mjs')),
  katex: () => load(jsdelivr('katex@0/dist/katex.mjs'))
}
