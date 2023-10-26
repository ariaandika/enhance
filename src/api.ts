
export type Api = typeof api
export const api = {
  listeners: [] as [string,CallableFunction][],

  once(eventType: string, cb: CallableFunction) {
    this.listeners.push([eventType,(r: string) => {
      api.unsubscribe(cb)
      cb(r)
    }])
  },

  subscribe(event: string, cb: CallableFunction) {
    if (this.listeners.some(e => e[1] == cb)) { return }
    this.listeners.push([event,cb])
    return this
  },

  unsubscribe(cb: CallableFunction) {
    this.listeners.splice(this.listeners.findIndex(e=>e[1]==cb),1)
    return this
  },

  emit(eventType: string, data: string) {
    for (let i = 0,len = this.listeners.length; i < len; i++) {
      const [ev,cb] = this.listeners[i]
      if (ev != eventType) continue
      try {
        cb(data)
      } catch (error: any) {
        api.emit('exception',error)
      }
    }
    return this
  }
}

// @ts-ignore
window.api = api
