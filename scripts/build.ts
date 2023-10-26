import { exists, mkdir } from "fs/promises"

export async function build(opt = {
  outdir: 'static/dist',
  outname: 'enhance.js',
  force: false
}) {
  const index = opt.outname

  if (!opt.force && await exists(opt.outdir + '/' + index)) {
    return
  }

  if (!await exists(opt.outdir)) {
    mkdir(opt.outdir,{ recursive: true })
  }
  
  let indexDir

  try {
    indexDir = Bun.resolveSync('@deuzo/enhance','.')
  } catch (error) {
    try {
      indexDir = Bun.resolveSync('./src/index.ts','.')
    } catch (e) {
      throw error
    }
  }

  return await Bun.build({
    entrypoints: [indexDir],
    target: 'browser',
    outdir: opt.outdir,
    naming: { entry: index },
    minify: true,
  })
}
