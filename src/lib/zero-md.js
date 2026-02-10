// @ts-nocheck
import ZeroMdBase from './zero-md-base.js'
import katexExtension from './katex-extension.js'
import { STYLES, LOADERS } from './presets.js'

let shikiHoisted
let mermaidHoisted
let katexHoisted
let uid = 0

export const ZeroMdFuncs = {
  async load(loaders = {}) {
      const {
        marked,
        markedBaseUrl,
        markedShiki,
        markedGfmHeadingId,
        markedAlert,
        shiki,
        mermaid,
        katex,
        katexOptions = { nonStandard: true, throwOnError: false },
        shikiOptions = { themes: { light: 'github-light', dark: 'github-dark' }}
      } = { ...LOADERS, ...loaders }
      this.template = STYLES.preset()
      const modules = await Promise.all([
        marked(),
        markedBaseUrl(),
        markedGfmHeadingId(),
        markedAlert(),
        markedShiki()
      ])
      this.marked = modules[0]
      this.setBaseUrl = modules[1]
      const parseKatex = async (text, displayMode) => {
        if (!katexHoisted) katexHoisted = await katex()
        return katexHoisted.renderToString(text, { displayMode, ...katexOptions })
      }
      this.marked.use(
        modules[2](),
        modules[3](),
        modules[4]({
          highlight: async (code, lang = '', props) => {
            if (lang === 'mermaid') {
              if (!mermaidHoisted) {
                mermaidHoisted = await mermaid()
                mermaidHoisted.initialize({ startOnLoad: false })
              }
              const { svg } = await mermaidHoisted.render(`mermaid-svg-${uid++}`, code)
              return svg
            }
            if (lang === 'math') return `<pre class="math">${await parseKatex(code, true)}</pre>`
            if (!shikiHoisted) shikiHoisted = await shiki()
            return shikiHoisted.codeToHtml(code, {
              lang: lang || 'text',
              meta: { __raw: props.join(' ') },
              ...shikiOptions
            })
          }
        }),
        {
          ...katexExtension(katexOptions),
          walkTokens: async (token) => {
            const types = ['inlineKatex', 'blockKatex']
            if (types.includes(token.type)) {
              token.text =
                (await parseKatex(token.text, token.displayMode)) +
                (token.type === types[1] ? '\n' : '')
            }
          }
        }
      )
    },

    /** @param {import('./zero-md-base.js').ZeroMdRenderObject} _obj */
    async parse({ text, baseUrl }) {
      this.marked.use(this.setBaseUrl(baseUrl || ''))
      return this.marked.parse(text)
    }
}

const ZeroMd = class extends ZeroMdBase {};

Object.assign(ZeroMd.prototype, ZeroMdFuncs);

export default ZeroMd;
