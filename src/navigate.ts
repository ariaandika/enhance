import { event } from "./event"
import { httpFetch } from "./fetch"
import { DEF_APP, DEF_SWAP, EMIT, GET, POST, applyDomAction, parseDomAction, query, } from "./main"
import type { Api } from "./api"

type popstate = { html: string, appId: string, swap: string }

window.addEventListener('popstate', popState)
document.addEventListener('click', anchor)
document.addEventListener('click', click)
document.addEventListener('click', eventEmmiter)

declare const prevent: event

function popState(e: PopStateEvent) {
  if (e.state) {
    const { html, appId, swap } = e.state as popstate

    const target = document.querySelector(appId) ?? app()

    if (!target) {
      return console.error('Invalid Target:',appId)
    }

    (target as any)[swap] = html
  }
}


async function anchor(e: MouseEvent) {
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
  const res = await httpFetch(href)
  const html = await res.text()
  
  if (pushState) {
    history.pushState({ html, appId, swap } satisfies popstate,'',href);
  }

  prevent.emit('preClientNavigate', { url: href })
  applyDomAction({ target, swap }, html)
  prevent.emit('clientNavigate', { url: href })
}


function app(custom?: string | null) {
  return custom ? query(custom) : (
    document.querySelector(DEF_APP) ?? document.body
  )
}

const actions = [GET,POST]

async function click(e: MouseEvent) {
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
  
  const res = await httpFetch(action, { method, body })
  const html = await res.text()

  applyDomAction(dom, html)
}

declare const api: Api

function eventEmmiter(e: MouseEvent) {
  const target = e.target as HTMLElement
  const eventString = target.getAttribute(EMIT)

  if (!eventString) return

  const eventFragments = eventString.split(' ')

  api.emit(eventFragments[0], eventFragments.slice(1).join(''))
}
