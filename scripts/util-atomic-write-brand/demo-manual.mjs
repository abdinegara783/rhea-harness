/**
 * Manual demo: atomic-write & brand
 * 
 * Run: npx tsx scripts/util-atomic-write-brand/demo-manual.mjs
 */

import { writeFileAtomic, withFileLock } from '../../packages/util/atomic-write/src/index.ts'
import { readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

console.log('=== DEMO: atomic-write ===\n')

// Demo 1: writeFileAtomic — tulis file tanpa corrupt
console.log('1. writeFileAtomic — tulis file atomik')
const demoFile = join(tmpdir(), 'demo-atomic.yaml')

// Tulis pertama
await writeFileAtomic(demoFile, 'theme: dark\n', { mode: 0o600 })
console.log(`   ✓ Tulis pertama: ${await readFile(demoFile, 'utf8')}`)

// Tulis kedua (replace)
await writeFileAtomic(demoFile, 'theme: light\n', { mode: 0o600 })
console.log(`   ✓ Tulis kedua (replace): ${await readFile(demoFile, 'utf8')}`)

// Cleanup
await rm(demoFile)
console.log('   ✓ File dibersihkan\n')

// Demo 2: withFileLock — antriin writer
console.log('2. withFileLock — cross-process writer lock')
const lockFile = join(tmpdir(), 'demo-lock.yaml')
await writeFile(lockFile, 'count: 0\n')

// Simulasi 3 proses yang mau nulis barengan
const processes = [
  { id: 'A', delay: 100 },
  { id: 'B', delay: 50 },
  { id: 'C', delay: 150 },
]

console.log('   Proses A, B, C mau nulis barengan...')

await Promise.all(processes.map(async (proc) => {
  await withFileLock(lockFile, async () => {
    const current = await readFile(lockFile, 'utf8')
    const count = parseInt(current.match(/count: (\d+)/)?.[1] || '0')
    console.log(`   [Proses ${proc.id}] Baca: count=${count}, nambah 1...`)
    
    // Simulasi kerja
    await new Promise(r => setTimeout(r, proc.delay))
    
    await writeFileAtomic(lockFile, `count: ${count + 1}\n`, { mode: 0o600 })
    console.log(`   [Proses ${proc.id}] Tulis: count=${count + 1}`)
  })
}))

const final = await readFile(lockFile, 'utf8')
console.log(`   ✓ Final: ${final.trim()} (harusnya count: 3)`)

await rm(lockFile)
console.log('   ✓ File dibersihkan\n')

console.log('=== DEMO: brand ===\n')

// Demo 3: Branded type — type-only, nggak ada runtime
console.log('3. Branded<B> — nominal typing (type-only)')
console.log('   Branded cuma ada di level TypeScript compiler, nggak ada runtime.')
console.log('   Di runtime, SessionId dan CallId tetap string biasa.')
console.log('   Tapi compiler bakal error kalau kamu ketukar.\n')

console.log('   Contoh di TypeScript:')
console.log('   ```typescript')
console.log("   type SessionId = Branded<'SessionId'>")
console.log("   type CallId = Branded<'CallId'>")
console.log('   ')
console.log('   function getSession(id: SessionId) { ... }')
console.log('   ')
console.log('   const callId: CallId = CallId("call-123")')
console.log('   getSession(callId)  // ❌ ERROR: CallId bukan SessionId')
console.log('   ```\n')

console.log('   Di Python (Django equivalent):')
console.log('   ```python')
console.log("   SessionId = Branded('SessionId')  # NewType")
console.log("   CallId = Branded('CallId')        # NewType")
console.log('   ')
console.log('   session_id: SessionId = SessionId("sess-123")')
console.log('   call_id: CallId = CallId("call-456")')
console.log('   ')
console.log('   # mypy bakal error kalau ketukar')
console.log('   ```\n')

console.log('=== DEMO SELESAI ===')
console.log('\nKesimpulan:')
console.log('• atomic-write: bikin penulisan file aman dari corrupt')
console.log('• withFileLock: antriin proses yang mau nulis file barengan')
console.log('• brand: bikin string yang secara tipe nggak bisa ketukar (type-only)')
