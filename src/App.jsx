import { useState } from 'react'
import { Plus, Check, Trash2, ListTodo } from 'lucide-react'

const PRI = {
  low:    { label: 'ต่ำ',  cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  medium: { label: 'กลาง', cls: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-500' },
  high:   { label: 'สูง',  cls: 'bg-red-100 text-red-700',         dot: 'bg-red-500' },
}
const ORDER = ['low', 'medium', 'high']
const FILTERS = [['all', 'ทั้งหมด'], ['active', 'ยังไม่เสร็จ'], ['done', 'เสร็จแล้ว']]

let nextId = 4
const seed = [
  { id: 1, text: 'ส่งรายงานก่อนเที่ยง', done: false, priority: 'high' },
  { id: 2, text: 'ซื้อของเข้าบ้าน', done: false, priority: 'medium' },
  { id: 3, text: 'อ่านหนังสือ 20 หน้า', done: true, priority: 'low' },
]

export default function App() {
  const [todos, setTodos] = useState(seed)
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('medium')
  const [filter, setFilter] = useState('all')
  const [editId, setEditId] = useState(null)
  const [editText, setEditText] = useState('')

  const add = () => {
    const t = text.trim()
    if (!t) return
    setTodos([{ id: nextId++, text: t, done: false, priority }, ...todos])
    setText('')
  }
  const toggle = (id) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  const cyclePri = (id) =>
    setTodos(todos.map((t) =>
      t.id === id ? { ...t, priority: ORDER[(ORDER.indexOf(t.priority) + 1) % 3] } : t))
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

  const remaining = todos.filter((t) => !t.done).length
  const doneCount = todos.length - remaining
  const shown = todos.filter((t) =>
    filter === 'all' || (filter === 'active' ? !t.done : t.done))
  const emptyMsg =
    filter === 'done' ? 'ยังไม่มีงานที่เสร็จ'
    : filter === 'active' ? 'ไม่มีงานค้างแล้ว'
    : 'ยังไม่มีงาน เพิ่มงานแรกด้านบนได้เลย'

  const card = { background: 'var(--card)', boxShadow: 'var(--shadow)' }

  return (
    <main className="max-w-xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold mb-5">รายการงานของฉัน</h1>

      <section className="rounded-2xl p-4 mb-4" style={card}>
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="เพิ่มงานใหม่..."
            aria-label="เพิ่มงานใหม่"
            className="flex-1 min-w-0 rounded-xl px-3 py-2.5 text-base border"
            style={{ background: 'var(--soft)', borderColor: 'var(--border)', color: 'var(--text)' }}
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
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-sm" style={{ color: 'var(--muted)' }}>ความสำคัญ</span>
          {ORDER.map((k) => (
            <button
              key={k}
              onClick={() => setPriority(k)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border transition"
              style={
                priority === k
                  ? { borderColor: 'var(--accent)', background: 'var(--soft)', color: 'var(--text)', fontWeight: 600 }
                  : { borderColor: 'var(--border)', color: 'var(--muted)' }
              }
            >
              <span className={`w-2 h-2 rounded-full ${PRI[k].dot}`} />
              {PRI[k].label}
            </button>
          ))}
        </div>
      </section>

      <div className="flex gap-1 p-1 rounded-xl mb-3" role="tablist" style={card}>
        {FILTERS.map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={filter === k}
            onClick={() => setFilter(k)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition"
            style={filter === k ? { background: '#4f46e5', color: '#fff' } : { color: 'var(--muted)' }}
          >
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
              <div className="flex items-center gap-3 rounded-2xl px-3.5 py-3" style={card}>
                <button
                  onClick={() => toggle(t.id)}
                  role="checkbox"
                  aria-checked={t.done}
                  aria-label="ทำเสร็จแล้ว"
                  className="shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center text-white transition"
                  style={t.done ? { background: '#4f46e5', borderColor: '#4f46e5' } : { borderColor: 'var(--border)' }}
                >
                  {t.done && <Check size={14} />}
                </button>

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
                    className="flex-1 min-w-0 rounded-lg px-2 py-1 border text-base"
                    style={{ background: 'var(--soft)', borderColor: 'var(--accent)', color: 'var(--text)' }}
                  />
                ) : (
                  <span
                    onDoubleClick={() => startEdit(t)}
                    title="ดับเบิลคลิกเพื่อแก้ไข"
                    className="flex-1 min-w-0 break-words select-none cursor-text"
                    style={t.done ? { textDecoration: 'line-through', color: 'var(--muted)' } : undefined}
                  >
                    {t.text}
                  </span>
                )}

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
                  className="shrink-0 p-1.5 rounded-lg transition hover:bg-red-50 hover:text-red-600"
                  style={{ color: 'var(--muted)' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      {todos.length > 0 && (
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
    </main>
  )
}
