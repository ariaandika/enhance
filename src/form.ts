/// <reference lib="dom"/>
/// <reference lib="dom.iterable"/>

import { httpFetch } from "./fetch";
import { parseDomAction, applyDomAction, INVALIDATE, FORM_INCLUDE, query, NO_RESET } from "./main";
import { event } from "./event";

document.addEventListener('submit', formEvent)


async function formEvent(e: SubmitEvent) {
  e.preventDefault()

  const target = e.target as HTMLFormElement
  const submitter = e.submitter as HTMLButtonElement
  
  let body = new FormData(target)
  let action = submitter.getAttribute('action') ?? target.action
  const method = target.method
  const include = target.getAttribute(FORM_INCLUDE)
  const formReset = !target.hasAttribute(NO_RESET)
  
  // Body parsing
  if (include) {
    const includes = include.split(' ')

    for (let i = 0, len = includes.length; i < len; i++) {
      const include = includes[i]

      if (include == '') continue

      const otherForm = query(include) as HTMLFormElement
      let otherEntries = new FormData(otherForm).entries()

      let ent
      while (!(ent = otherEntries.next()).done) {
        body.append(ent.value[0], ent.value[1])
      }
    }
  }

  if (method.toLowerCase() == 'get') {
    action += "?" + (new URLSearchParams(body as any).toString())
    body = undefined as any
  }

  const res = await httpFetch(action,{
    method, body,
  })

  // Post Submision
  const ok = res.status < 300 && res.status > 199
  const invalidateAtr = (target.getAttribute(INVALIDATE)) ?? true
  const invalidate = typeof invalidateAtr == 'string' ? (invalidateAtr == 'true') : invalidateAtr

  resetInput(target,'input[type="password"]')

  if (ok && formReset) {
    resetInput(target, `input[type]:not([${NO_RESET}])`)
  }

  if (invalidate && ok) {
    event.emit('invalidate',{id:target.id})
  }

  const dom = parseDomAction(target)
  applyDomAction(dom,await res.text())
}

function resetInput(target: Element, query: string) {
  target.querySelectorAll(query).forEach((e:any) => e.value = '')
}















