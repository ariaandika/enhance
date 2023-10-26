
// Main
export const GET = 'pr-get'
export const POST = 'pr-post'
export const FORM = 'pr-form'
export const LOAD = 'pr-load'
export const EMIT = 'pr-emit'

// Modifier
export const TARGET = 'pr-target'
export const SWAP = 'pr-swap'

/**
 * if used in form, can be set true or false, form id is in event detail
 * if used in element, can be set to "url id", or just "url" to accept any id
 */
export const INVALIDATE = 'pr-invalidate'

export const FORM_INCLUDE = 'pr-include'
export const NO_RESET = 'pr-noreset'

export const DEF_SWAP = 'innerHTML'
export const DEF_APP = '#app'

// Http
export const LOCATION_HEADER = 'pr-location'
export const REQUEST_HEADER = 'pr-request'
export const MODULE_HEADER = 'pr-module'

// module header syntax: /dist/app.js global=somename&fetch=always; /dist/tw.js fetch=once


/** Parse Attributes */
export function parseDomAction(elem: Element) {
  let targetAtr = elem.getAttribute(TARGET)
  return {
    elem,
    targetAtr,
    target: targetAtr ? query(targetAtr) : elem,
    swap: elem.getAttribute(SWAP) ?? DEF_SWAP
  }
}

export function applyDomAction(val: { target: Element, swap: string, targetAtr?: string | null }, html: string) {
  if (val.targetAtr === 'none') return
  (val.target as any)[val.swap] = html;
}

/** querySelector, but throw when target invalid */
export function query(selector: string) {
  if (selector == 'none') return undefined as any as Element
  const target = document.querySelector(selector)
  if (!target) {
    throw `Invalid Target: ${selector}`
  }
  return target
}

