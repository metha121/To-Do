import { useState } from 'react'
import { Plus, Check, Trash2, ListTodo, Search, CalendarDays } from 'lucide-react'

/* ---------- constants ---------- */
const PRI = {
  low:    { label: 'ต่ำ',  cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  medium: { label: 'กลาง', cls: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-500' },
  high:   { label: 'สูง',  cls: 'bg-red-100 text-red-700',         dot: 'bg-red-500' },
}
const ORDER = ['low', 'medium', 'high']

const CATS = {
  work:     { label: 'งาน',      cls: 'bg-sky-100 text-sky-700',       dot: 'bg-sky-500' },
  personal: { label: 'ส่วนตัว',   cls: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
  shopping: { label: 'ช้อปปิ้ง',  cls: 'bg-pink-100 text-pink-700',     dot: 'bg-pink-500' },
  health:   { label: 'สุขภาพ',   cls: 'bg-teal-100 text-teal-700',     dot: 'bg-teal-500' },
}
const CAT_ORDER = ['work', 'personal', 'shopping', 'health']

const FILTERS = [['all', 'ทั้งหมด'], ['active', 'ยังไม่เสร็จ'], ['done', 'เสร็จแล้ว']]
const STATUS_COLORS = { done: '#4f46e5', active: '#38bdf8', overdue: '#ef4444' }

/* ---------- date helpers ---------- */
const pad = (n) => String(n).padStart(2, '0')
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const offsetDay = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return ymd(d) }
const fmtDate = (s) =>
  new Date(s + 'T00:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })

/* ---------- seed ---------- */
let nextId = 6
const seed = [
  { id: 1, text: 'ส่งรายงานก่อนเที่ยง', done: false, priority: 'high',   cat: 'work',     due: offsetDay(0) },
  { id: 2, text: 'ซื้อของเข้าบ้าน',      done: false, priority: 'medium', cat: 'shopping', due: offsetDay(2) },
  { id: 3, text: 'อ่านหนังสือ 20 หน้า',   done: true,  priority: 'low',    cat: 'personal', due: '' },
  { id: 4, text: 'ส่งอีเมลสรุปประชุม',    done: false, priority: 'medium', cat: 'work',     due: offsetDay(-1) },
  { id: 5, text: 'ไปออกกำลังกาย',        done: false, priority: 'low',    cat: 'health',   due: '' },
]

/* ---------- small components ---------- */
function Donut({ segs, total, percent }) {
  const R = 40
  const C = 2 * Math.PI * R
  let offset = 0
  return (
    <div className="relative w-28 h-28 shrink-0" role="img"
         aria-label={`เสร็จแล้ว ${percent}%`}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={R} fill="none" stroke="var(--border)" strokeWidth="12" />
        {total > 0 && segs.map((s) => {
          const len = (s.value / total) * C
          const el = len > 0 && (
            <circle key={s.key} cx="50" cy="50" r={R} fill="none" stroke={s.color}
                    strokeWidth="12" strokeDasharray={`${len} ${C - len}`}
                    strokeDashoffset={-offset} />
          )
          offset += len
          return el
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold leading-none">{percent}%</span>
        <span className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>เสร็จแล้ว</span>
      </div>
    </div>
  )
}

/* ---------- app ---------- */
export default function App() {
  const [todos, setTodos] = useState(seed)
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('medium')
  const [cat, setCat] = useState('personal')
  const [due, setDue] = useState('')
  const [filter, setFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [editId, setEditId] = useState(null)
  const [editText, setEditText] = useState('')

  const today = ymd(new Date())

  const add = () => {
    const t = text.trim()
    if (!t) return
    setTodos([{ id: nextId++, text: t, done: false, priority, cat, due }, ...todos])
    setText('')
    setDue('')
  }
  const toggle = (id) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  const cyclePri = (id) =>
    setTodos(todos.map((t) =>
      t.id === id ? { ...t, priority: ORDER[(ORDER.indexOf(t.priority) + 1) % 3] } : t))
  const cycleCat = (id) =>
    setTodos(todos.map((t) =>
      t.id === id ? { ...t, cat: CAT_ORDER[(CAT_ORDER.indexOf(t.cat) + 1) % 4] } : t))
  const remove = (id) => {
    setTodos((ts) => ts.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
    setTimeout(() => setTodos((ts) => ts.filter((t) => t.id !== id)), 360)
  }
  const clearDone = () => {
    const ids = todos.filter((t) => t.done).map((t) => t.id)
    setTodos((ts) => ts.map((t) => (t.done ? { ...t, leaving: true } : t)))
    setTimeout(() => setTodos((ts) => ts.filter((t) => !ids.includes(t.id))), 360)
  }
  const startEdit = (t) => { setEditId(t.id); setEditText(t.text) }
  const saveEdit = () => {
    const v = editText.trim()
    if (editId !== null)
      setTodos(todos.map((t) => (t.id === editId ? { ...t, text: v || t.text } : t)))
    setEditId(null)
  }

  /* derived */
  const q = query.trim().toLowerCase()
  const shown = todos.filter((t) =>
    (catFilter === 'all' || t.cat === catFilter) &&
    (filter === 'all' || (filter === 'active' ? !t.done : t.done)) &&
    (!q || t.text.toLowerCase().includes(q)))

  const total = todos.length
  const doneCount = todos.filter((t) => t.done).length
  const overdueCount = todos.filter((t) => !t.done && t.due && t.due < today).length
  const activeCount = total - doneCount - overdueCount
  const remaining = total - doneCount
  const percent = total ? Math.round((doneCount / total) * 100) : 0
  const segs = [
    { key: 'done', label: 'เสร็จแล้ว', value: doneCount, color: STATUS_COLORS.done },
    { key: 'active', label: 'กำลังทำ', value: activeCount, color: STATUS_COLORS.active },
    { key: 'overdue', label: 'เลยกำหนด', value: overdueCount, color: STATUS_COLORS.overdue },
  ]
  const countOf = (k) => todos.filter((t) => t.cat === k).length

  const emptyMsg = q ? 'ไม่พบงานที่ค้นหา'
    : filter === 'done' ? 'ยังไม่มีงานที่เสร็จ'
    : filter === 'active' ? 'ไม่มีงานค้างแล้ว'
    : 'ยังไม่มีงาน เพิ่มงานแรกด้านบนได้เลย'

  const card = { background: 'var(--card)', boxShadow: 'var(--shadow)' }
  const field = { background: 'var(--soft)', borderColor: 'var(--border)', color: 'var(--text)' }
  const pill = (on) => on
    ? { borderColor: 'var(--accent)', background: 'var(--soft)', color: 'var(--text)', fontWeight: 600 }
    : { borderColor: 'var(--border)', color: 'var(--muted)' }

  const dueBadge = (t) => {
    if (!t.due) return null
    let cls = 'bg-slate-100 text-slate-600'
    let label = fmtDate(t.due)
    if (!t.done && t.due < today) { cls = 'bg-red-100 text-red-700'; label = `เลยกำหนด · ${label}` }
    else if (!t.done && t.due === today) { cls = 'bg-yellow-100 text-yellow-800'; label = 'ครบกำหนดวันนี้' }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
        <CalendarDays size={12} />{label}
      </span>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold mb-5">รายการงานของฉัน</h1>

      <div className="grid gap-4 md:grid-cols-[220px_1fr] items-start">
        {/* ---------- sidebar ---------- */}
        <aside className="grid gap-4 md:sticky md:top-6">
          <nav className="rounded-2xl p-3" style={card} aria-label="หมวดหมู่">
            <p className="text-sm font-semibold px-2 mb-2">หมวดหมู่</p>
            <div className="flex flex-wrap md:flex-col gap-1">
              {[['all', 'ทั้งหมด', null, total], ...CAT_ORDER.map((k) => [k, CATS[k].label, CATS[k].dot, countOf(k)])]
                .map(([k, label, dot, n]) => (
                  <button
                    key={k}
                    onClick={() => setCatFilter(k)}
                    aria-pressed={catFilter === k}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition md:w-full"
                    style={catFilter === k
                      ? { background: '#4f46e5', color: '#fff', fontWeight: 600 }
                      : { color: 'var(--text)' }}
                  >
                    {dot ? <span className={`w-2 h-2 rounded-full ${dot}`} /> : <ListTodo size={14} />}
                    <span className="flex-1 text-left">{label}</span>
                    <span className="text-xs tabular-nums opacity-80">{n}</span>
                  </button>
                ))}
            </div>
          </nav>

          <section className="rounded-2xl p-4" style={card} aria-label="สถิติ">
            <p className="text-sm font-semibold mb-3">สถิติ</p>
            <div className="flex md:flex-col items-center gap-4">
              <Donut segs={segs} total={total} percent={percent} />
              <div className="flex-1 w-full text-sm">
                <p className="mb-2" style={{ color: 'var(--muted)' }}>
                  งานทั้งหมด <b className="text-base" style={{ color: 'var(--text)' }}>{total}</b>
                </p>
                <ul className="list-none p-0 m-0 grid gap-1">
                  {segs.map((s) => (
                    <li key={s.key} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                      <span className="flex-1">{s.label}</span>
                      <b className="tabular-nums">{s.value}</b>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </aside>

        {/* ---------- main ---------- */}
        <div className="min-w-0">
          <section className="rounded-2xl p-4 mb-4" style={card}>
            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && add()}
                placeholder="เพิ่มงานใหม่..."
                aria-label="เพิ่มงานใหม่"
                className="flex-1 min-w-0 rounded-xl px-3 py-2.5 text-base border"
                style={field}
              />
              <button
                onClick={add}
                aria-label="เพิ่มงาน"
                className="shrink-0 flex items-center gap-1.5 rounded-xl px-4 text-white font-medium active:scale-95 transition"
                style={{ background: '#4f46e5' }}
              >
                <Plus size={18} />
                <span className="hidden sm:inline">เพิ่ม</span>
              </button>
            </div>

            <div className="grid gap-2.5 mt-3 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-16" style={{ color: 'var(--muted)' }}>ความสำคัญ</span>
                {ORDER.map((k) => (
                  <button key={k} onClick={() => setPriority(k)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full border transition"
                    style={pill(priority === k)}>
                    <span className={`w-2 h-2 rounded-full ${PRI[k].dot}`} />{PRI[k].label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-16" style={{ color: 'var(--muted)' }}>หมวดหมู่</span>
                {CAT_ORDER.map((k) => (
                  <button key={k} onClick={() => setCat(k)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full border transition"
                    style={pill(cat === k)}>
                    <span className={`w-2 h-2 rounded-full ${CATS[k].dot}`} />{CATS[k].label}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 flex-wrap">
                <span className="w-16" style={{ color: 'var(--muted)' }}>กำหนดส่ง</span>
                <input type="date" value={due} onChange={(e) => setDue(e.target.value)}
                  className="rounded-lg px-2.5 py-1 border" style={field} />
                {due && (
                  <button type="button" onClick={() => setDue('')}
                    className="text-xs underline" style={{ color: 'var(--muted)' }}>ล้างวันที่</button>
                )}
              </label>
            </div>
          </section>

          <div className="relative mb-3">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--muted)' }} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหางาน..."
              aria-label="ค้นหางาน"
              className="w-full rounded-xl pl-10 pr-3 py-2.5 text-base border"
              style={{ ...field, background: 'var(--card)' }}
            />
          </div>

          <div className="flex gap-1 p-1 rounded-xl mb-3" role="tablist" style={card}>
            {FILTERS.map(([k, label]) => (
              <button key={k} role="tab" aria-selected={filter === k} onClick={() => setFilter(k)}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition"
                style={filter === k ? { background: '#4f46e5', color: '#fff' } : { color: 'var(--muted)' }}>
                {label}
              </button>
            ))}
          </div>

          <ul className="list-none p-0 m-0">
            {shown.length === 0 ? (
              <li className="rounded-2xl py-10 text-center" style={{ ...card, color: 'var(--muted)' }}>
                <div className="flex justify-center mb-2 opacity-60"><ListTodo size={28} /></div>
                {emptyMsg}
              </li>
            ) : (
              shown.map((t) => (
                <li key={t.id} className={`item mb-2.5${t.leaving ? ' leaving' : ''}`}>
                  <div className="flex items-start gap-3 rounded-2xl px-3.5 py-3" style={card}>
                    <button
                      onClick={() => toggle(t.id)}
                      role="checkbox"
                      aria-checked={t.done}
                      aria-label="ทำเสร็จแล้ว"
                      className="shrink-0 mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center text-white transition"
                      style={t.done ? { background: '#4f46e5', borderColor: '#4f46e5' } : { borderColor: 'var(--border)' }}
                    >
                      {t.done && <Check size={14} />}
                    </button>

                    <div className="flex-1 min-w-0">
                      {editId === t.id ? (
                        <input
                          autoFocus
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit()
                            if (e.key === 'Escape') setEditId(null)
                          }}
                          className="w-full rounded-lg px-2 py-1 border text-base"
                          style={{ ...field, borderColor: 'var(--accent)' }}
                        />
                      ) : (
                        <span
                          onDoubleClick={() => startEdit(t)}
                          title="ดับเบิลคลิกเพื่อแก้ไข"
                          className="block break-words select-none cursor-text"
                          style={t.done ? { textDecoration: 'line-through', color: 'var(--muted)' } : undefined}
                        >
                          {t.text}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                        <button
                          onClick={() => cycleCat(t.id)}
                          title="แตะเพื่อเปลี่ยนหมวดหมู่"
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${CATS[t.cat].cls}`}
                        >
                          {CATS[t.cat].label}
                        </button>
                        {dueBadge(t)}
                      </div>
                    </div>

                    <button
                      onClick={() => cyclePri(t.id)}
                      title="แตะเพื่อเปลี่ยนความสำคัญ"
                      className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${PRI[t.priority].cls}`}
                    >
                      {PRI[t.priority].label}
                    </button>

                    <button
                      onClick={() => remove(t.id)}
                      aria-label="ลบงาน"
                      className="shrink-0 p-1.5 -my-1 rounded-lg transition hover:bg-red-50 hover:text-red-600"
                      style={{ color: 'var(--muted)' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>

          {total > 0 && (
            <div className="flex items-center justify-between mt-4 px-1 text-sm" style={{ color: 'var(--muted)' }}>
              <span>
                เหลืออีก <b style={{ color: 'var(--text)' }}>{remaining}</b> งาน
              </span>
              <button
                onClick={clearDone}
                disabled={doneCount === 0}
                className="px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-50 hover:text-red-600"
              >
                ล้างที่เสร็จแล้ว ({doneCount})
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
