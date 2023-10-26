import { emitKeypressEvents } from "readline"
import { enhanceEvent } from "./event"
import { enhanceFetch } from "./fetch"
import { DEF_APP, DEF_SWAP, EMIT, GET, POST, applyDomAction, parseDomAction, query, } from "./main"

type popstate = { html: string, appId: string, swap: string }

export function popStateHandler(e: PopStateEvent) {
  if (e.state) {
    const { html, appId, swap } = e.state as popstate

    const target = document.querySelector(appId) ?? app()

    if (!target) {
      return console.error('Invalid Target:',appId)
    }

    (target as any)[swap] = html
  }
}


export async function anchorHandler(e: MouseEvent) {
  const target = e.target as HTMLAnchorElement
  const dom = parseDomAction(target)
  const currentApp = app(dom.targetAtr)
  const anchorMode = target.target
  
  if (!currentApp ||
      target.tagName !== 'A' ||
      anchorMode === "_blank" ||
      anchorMode === "_self"
     )
  return

  e.preventDefault()

  dom.target = currentApp
  
  anchorNavigate(target.href, dom)
}


export async function anchorNavigate(href: string, {
  target = app(),
  swap = DEF_SWAP,
  appId = DEF_APP,
  pushState = true
}) {
  const res = await enhanceFetch(href)
  const html = await res.text()
  
  if (pushState) {
    history.pushState({ html, appId, swap } satisfies popstate,'',href);
  }

  enhanceEvent.emit('preClientNavigate', { url: href })
  applyDomAction({ target, swap }, html)
  enhanceEvent.emit('clientNavigate', { url: href })
}


function app(custom?: string | null) {
  return custom ? query(custom) : (
    document.querySelector(DEF_APP) ?? document.body
  )
}

const actions = [GET,POST]

export async function clickHandler(e: MouseEvent) {
  const target = e.target as HTMLElement
  const dom = parseDomAction(target)
  const name = target.getAttribute('name')
  const value = target.getAttribute('value') ?? ''
  let action
  let method
  let body

  if (action = actions.find(act => target.hasAttribute(act))) {
    method = action.slice(3) // pr-post => get
    action = target.getAttribute(action)!

    if (name) {
      if (method == 'get' && target.hasAttribute('name')) {
        action += `?${name}=${value}`
      } else {
        body = `{"${name}":"${value}"}`
      }
    }

  } else {
    return
  }
  
  const res = await enhanceFetch(action, { method, body })
  const html = await res.text()

  applyDomAction(dom, html)
}

export function eventEmitHandler(e: MouseEvent) {
  const target = e.target as HTMLElement
  const eventString = target.getAttribute(EMIT)

  if (!eventString) return

  const eventFragments = eventString.split(' ')

  enhanceEvent.emit(eventFragments[0], eventFragments.slice(1).join(''))
}
