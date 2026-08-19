// E2E boot — phase 1.10 Vendor integration.
// Mencerminkan alur vendor/cordis/bin.js secara persis:
//   ctx.plugin(Loader) → ctx.loader.create({ name: include, config: { path: './cordis.yml' } })
// Perbedaan jujur: bin.js berjalan di ORIGINAL dengan lib/ hasil tsdown (build penuh
// = phase 2.1); e2e ini memakai lib/ hasil tsc -b + shim re-export sementara.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import { TimerService } from '@deepseek-ai/cordis-plugin-timer'

const FIXTURE = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'basic')

test('boot minimal cordis.yml melalui loader + include (alur bin.js)', async () => {
  const ctx = new Context()
  ctx.baseUrl = pathToFileURL(FIXTURE).href + '/'
  try {
    // bin.js: await ctx.plugin(Loader)
    await ctx.plugin(Loader)
    // bin.js: await ctx.loader.create({ name: include, config: { path: './cordis.yml' } })
    await ctx.loader.create({
      name: '@deepseek-ai/cordis-plugin-include',
      config: { path: './cordis.yml' },
    })

    // include membaca ./cordis.yml → mount entry 'timer-demo'
    const entries = [...ctx.loader.entries()]
    const timerDemo = entries.find((entry) => entry.options.id === 'timer-demo')
    assert.ok(timerDemo, `entry timer-demo ada di tree (entries: ${entries.map((e) => e.options.id)})`)
    assert.equal(timerDemo.options.name, '@deepseek-ai/cordis-plugin-timer')

    // entry fiber aktif (uid terisi = tidak disposed)
    assert.ok(timerDemo.fiber?.uid, 'fiber entry timer-demo aktif')
    assert.equal(timerDemo.fiber.config.interval, 1000)

    // plugin timer ter-mount sebagai service di context
    assert.ok(ctx.timer instanceof TimerService, 'ctx.timer = TimerService')

    // event lifecycle: fiber plugin diterbitkan ke registry
    assert.ok(ctx.registry.has(timerDemo.fiber.runtime.callback), 'callback terdaftar di registry')
  } finally {
    await ctx.fiber.dispose()
  }
})
