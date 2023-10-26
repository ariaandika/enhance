import { httpFetch } from "./fetch"
import { INVALIDATE, applyDomAction, parseDomAction } from "./main"

declare global {
  interface EventType {
    invalidate: { id: string },
    clientNavigate: { url: string },
    preClientNavigate: { url: string },
    exception: { error: any }
  }
}
export type event = typeof event
export const event = {
  listeners: [] as [keyof EventType,CallableFunction][],

  once<T extends keyof EventType>(eventType: T, cb: Cb<[EventType[T]],MaybePromise<Cb | void>>) {
    this.listeners.push([eventType,(r: EventType[T]) => {
      event.unsubscribe(cb as any)
      cb(r)
    }])
  },

  subscribe<T extends keyof EventType>(event: T, cb: Cb<[EventType[T]],MaybePromise<Cb | void>>) {
    this.listeners.push([event,cb])
    return this
  },

  unsubscribe(cb: Cb<[EventType[keyof EventType]],MaybePromise<Cb | void>>) {
    this.listeners.splice(this.listeners.findIndex(e=>e[1]==cb),1)
    return this
  },

  emit<T extends keyof EventType>(eventType: T, data: EventType[T]) {
    for (let i = 0,len = this.listeners.length; i < len; i++) {
      const [ev,cb] = this.listeners[i]
      if (ev != eventType) continue
      try {
        cb(data)
      } catch (error: any) {
        event.emit('exception',error)
      }
    }
    return this
  }
}

// @ts-ignore
window.prevent = event

// invalidate event
document.querySelectorAll(`[${INVALIDATE}]`).forEach(elem => event.subscribe('invalidate',async ev => {
  const [url,id] = elem.getAttribute(INVALIDATE)!.split(' ')
  if (id && ev.id != id) return

  const res = await httpFetch(url)
  const dom = parseDomAction(elem)
  applyDomAction(dom, await res.text())
}))



