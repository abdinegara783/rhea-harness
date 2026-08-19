// Sandbox manual — validasi vendor dengan API publik (tanpa framework test).
// Jalankan: node scripts/vendor-e2e/manual-check.mjs
// Semua paket di-import lewat nama npm (@deepseek-ai/*) seperti kode produksi.
import { Context } from '@deepseek-ai/cordis'
import { camelCase, deepEqual, Time } from '@deepseek-ai/cosmokit'
import z from '@deepseek-ai/schemastery'
import { Loader } from '@deepseek-ai/cordis-plugin-loader'
import { TimerService } from '@deepseek-ai/cordis-plugin-timer'
import { ConsoleExporter } from '@deepseek-ai/cordis-plugin-logger-console'
import Hmr from '@deepseek-ai/cordis-plugin-hmr'

const check = (label, cond, detail = '') =>
  console.log(`${cond ? '✅' : '❌'} ${label}${detail ? ' — ' + detail : ''}`)

// --- cosmokit: util murni, paling cepat diuji ---
check('cosmokit.camelCase', camelCase('foo-bar') === 'fooBar', camelCase('foo-bar'))
check('cosmokit.deepEqual', deepEqual({ a: 1 }, { a: 1 }))
check('cosmokit.Time', Time.second === 1000 && Time.format(1500) !== '', Time.format(1500))

// --- schemastery: validasi skema (default export = z; skema = callable) ---
const schema = z.object({ name: z.string().required(), count: z.number().min(0) })
check('schemastery.callable ok', schema({ name: 'demo', count: 2 }).name === 'demo')
check('schemastery.callable reject', (() => { try { schema({ count: -1 }); return false } catch { return true } })())

// --- cordis: IoC + event + service ---
const ctx = new Context()
let emitted = 0
ctx.on('ping', () => { emitted++ })
ctx.emit('ping')
check('cordis.event on/emit', emitted === 1)

class Greeter {
  constructor(c) { c.provide('greeter', this) }
  hello() { return 'hai' }
}
new Greeter(ctx)
check('cordis.provide/get', ctx.get('greeter').hello() === 'hai', ctx.get('greeter').hello())

// --- loader + include: boot cordis.yml (alur bin.js persis) ---
ctx.baseUrl = 'file://' + process.cwd() + '/scripts/vendor-e2e/fixtures/basic/'
await ctx.plugin(Loader)
await ctx.loader.create({ name: '@deepseek-ai/cordis-plugin-include', config: { path: './cordis.yml' } })
const entries = [...ctx.loader.entries()]
check('loader.boot entry timer-demo',
  entries.some((e) => e.options.id === 'timer-demo'), `entries: ${entries.map((e) => e.options.id)}`)

// --- timer: service dari entry timer-demo (bukan manual) ---
check('timer.service terpasang', ctx.timer instanceof TimerService)
await new Promise((resolve) => {
  let fired = false
  ctx.timeout(() => { fired = true }, 50)
  setTimeout(() => { check('timer.timeout callback', fired); resolve() }, 120)
})

// --- hmr + logger-console: instansiasi (perlu --expose-internals utk hmr) ---
const hmr = new Hmr(ctx, { root: process.cwd() })
check('hmr.terdaftar sebagai service', ctx.hmr instanceof Hmr)
const exporter = new ConsoleExporter(ctx)
check('logger-console.ConsoleExporter', typeof exporter.render === 'function' && typeof exporter.export === 'function')

await ctx.fiber.dispose()
console.log('\nSelesai — jalankan ulang kapan saja; hasil ✅/❌ langsung terlihat.')
