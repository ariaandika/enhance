export const enhanceEvent = {
  listeners: [] as [string,CallableFunction][],

  once<T extends keyof EnhanceEvent | string & {}>(eventType: T, cb: Cb<[T extends keyof EnhanceEvent ? EnhanceEvent[T] : any],MaybePromise<Cb | void>>) {
    this.listeners.push([eventType,(r: any) => {
      enhanceEvent.unsubscribe(cb as any)
      cb(r)
    }])
  },

  subscribe<T extends keyof EnhanceEvent | string & {}>(eventType: T, cb: Cb<[T extends keyof EnhanceEvent ? EnhanceEvent[T] : any],MaybePromise<Cb | void>>) {
    this.listeners.push([eventType,cb])
    return this
  },

  unsubscribe(cb: CallableFunction) {
    this.listeners.splice(this.listeners.findIndex(e=>e[1]==cb),1)
    return this
  },

  emit<T extends keyof EnhanceEvent | string & {}>(eventType: T, data: T extends keyof EnhanceEvent ? EnhanceEvent[T] : any) {
    for (let i = 0,len = this.listeners.length; i < len; i++) {
      const [ev,cb] = this.listeners[i]
      if (ev != eventType) continue
      try {
        cb(data)
      } catch (error) {
        enhanceEvent.emit('exception',error)
      }
    }
    return this
  }
}

