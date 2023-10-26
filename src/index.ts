import { INVALIDATE, parseDomAction, applyDomAction } from "./main.ts";
import { enhanceEvent } from "./event.ts";
import { enhanceFetch } from "./fetch.ts";
import { clickHandler, anchorHandler, eventEmitHandler, popStateHandler, anchorNavigate } from "./navigate.ts";
import { formEvent } from "./form.ts";

window.addEventListener('popstate', popStateHandler)
document.addEventListener('submit', formEvent)
document.addEventListener('click', anchorHandler)
document.addEventListener('click', clickHandler)
document.addEventListener('click', eventEmitHandler)

// invalidate event
document.querySelectorAll(`[${INVALIDATE}]`).forEach(elem => enhanceEvent.subscribe('invalidate',async ev => {
  const [url,id] = elem.getAttribute(INVALIDATE)!.split(' ')
  if (id && ev.id != id) return

  const res = await enhanceFetch(url)
  const dom = parseDomAction(elem)
  applyDomAction(dom, await res.text())
}))

/// look for initial enhance module, script tag in header
document.querySelectorAll('script[opt]').forEach(async e => {
  const src = e.getAttribute('src')!
  const opt = new URLSearchParams(e.getAttribute('opt')!)
  let app = await import(src)

  if (opt.get('exec') === 'always') {
    await app.default()
  }

  if (opt.has('global')) {
    // @ts-ignore
    window[opt.get('global')] = app
  }
})


/// Register
const enhance = {
  event: enhanceEvent,
  fetch: enhanceFetch,
  applyDomAction,
  parseDomAction,

  async runDomAction(href: string,opt: Parameters<typeof applyDomAction>[0]) {
    const res = await enhanceFetch(href,{  }).then(e=>e.text())
    applyDomAction(opt,res)
  },

  anchorNavigate,
}

window.enhance = enhance

export type Enhance = typeof enhance
