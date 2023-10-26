import { event } from "./event";
import { LOCATION_HEADER, REQUEST_HEADER, MODULE_HEADER } from "./main";

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

function reverseProxy(res: Response) {
  let targetLocation = res.headers.get(LOCATION_HEADER)

  if (targetLocation) {
    window.location.pathname = targetLocation
    return
  }
}

async function parseModulesHeader(mods: string | null) {
  if (mods === null) return

  const scripts = mods.split('; ')

  for (let i = 0, len = scripts.length; i < len; i++) {
    const [src,_] = scripts[i].split(' ')
    const opt = new URLSearchParams(_)
    let app = await import(src)

    if (opt.get('exec') === 'always') {
      await app.default()
    }

    if (opt.has('global')) {
      // @ts-ignore
      window[opt.get('global')] = app
    }
  }
}

export async function httpFetch(url: string, opt?: Parameters<typeof fetch>[1]) {
  const o = opt ?? {} as any

  o.headers ??= {} as any
  o.headers[REQUEST_HEADER] = 'true'

  try {
    const res = await fetch(url,o)

    await parseModulesHeader(res.headers.get(MODULE_HEADER))

    reverseProxy(res)
    return res
  } catch (error) {
    event.emit('exception',{ error })
    throw error
  }
}
