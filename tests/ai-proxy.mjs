/** Uji /api/ai tanpa akun: Next.js harus hidup dan AI_BASE_URL menunjuk provider aktif (mis. Ollama lokal). */
const base = process.env.LAB08_BASE_URL ?? 'http://127.0.0.1:3000'
let checks = 0

function check(label, condition, hint = '') {
  if (!condition) {
    console.log(`FAIL ${label}${hint ? `\n     -> ${hint}` : ''}`)
    process.exit(1)
  }
  checks += 1
  console.log(`PASS ${label}`)
}

async function post(prompt) {
  const res = await fetch(`${base}/api/ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })
  return { res, body: await res.json().catch(() => ({})) }
}

let empty
try {
  empty = await post(' ')
} catch {
  check(`Next.js hidup di ${base}`, false, 'jalankan npm run dev atau npm run start dulu di terminal lain')
}
check('prompt kosong ditolak HTTP 400', empty.res.status === 400,
  `HTTP ${empty.res.status}; cek konfigurasi dan jalankan Next.js ulang`)

const started = Date.now()
const { res, body } = await post('Apa itu Docker? Jawab maksimal 2 kalimat.')
const hints = {
  503: 'isi AI_BASE_URL dan AI_MODEL di .env.local, lalu restart server Next.js',
  502: `${body.error ?? 'provider menolak'}; samakan AI_MODEL persis dengan output "ollama list"`,
  504: 'Ollama mati atau melewati AI_TIMEOUT_MS; laptop lambat: isi AI_TIMEOUT_MS=60000 di .env.local lalu restart server',
}
check('jawaban provider diteruskan (HTTP 200)', res.status === 200 && typeof body.answer === 'string' && body.answer.length > 0,
  `HTTP ${res.status}: ${hints[res.status] ?? body.error ?? 'cek log server'}`)
check('respons membawa X-Request-ID', Boolean(res.headers.get('x-request-id')))
console.log(`ai-proxy: ${checks} PASS, 0 FAIL  (${Date.now() - started} ms; jawaban: ${body.answer.slice(0, 60)})`)
