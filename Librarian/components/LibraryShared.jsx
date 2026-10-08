import { useEffect } from 'react'
import { AlertCircle, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, MoreHorizontal, Plus, Search, Trash2, X } from 'lucide-react'
import { daysLate, formatDate, hashPassword, money, normalizeEmail, today } from '../lib/helpers.js'

export function CoverArt({ book, compact = false }) {
  const toneMap = {
    'cover-new': 'from-[#173b63] via-[#173b63] to-[#94a3b8]',
    'cover-gold': 'from-[#94a3b8] via-[#94a3b8] to-[#e2e8f0]',
    'cover-forest': 'from-[#2d5b52] via-[#4d8a70] to-[#cfe8d5]',
    'cover-coral': 'from-[#b85d4d] via-[#d77c65] to-[#f7dccb]',
    'cover-ink': 'from-[#173b63] via-[#173b63] to-[#94a3b8]',
  }

  return (
    <div className={`relative overflow-hidden rounded-[18px] border border-white/10 bg-gradient-to-br ${toneMap[book.tone || 'cover-new']} p-4 text-white shadow-[0_18px_35px_rgba(17,31,57,0.18)] ${compact ? 'h-[130px]' : 'h-[220px]'}`} aria-label={`Cover artwork for ${book.title}`}>
      <span className="mb-3 block text-[9px] font-semibold uppercase tracking-[0.2em] text-white/75">NU LIBRARY · {book.category.toUpperCase()}</span>
      <span className="absolute inset-0 opacity-20" />
      <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-[#f8fafc]/10 text-[11px] font-bold">NU</span>
      <span className="mt-4 block text-[clamp(1rem,2vw,1.65rem)] font-black leading-tight tracking-tight">{book.title}</span>
      <span className="mt-2 block text-xs text-white/80">{book.author}</span>
    </div>
  )
}

export function StatusPill({ status }) {
  const normalized = status.toLowerCase().replaceAll(' ', '-')
  const map = {
    active: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
    borrowed: 'border border-[#e2e8f0] bg-[#e2e8f0] text-[#64748b]',
    overdue: 'border border-red-200 bg-red-50 text-red-700',
    returned: 'border border-amber-200 bg-amber-50 text-amber-700',
    'on-hold': 'border border-orange-200 bg-orange-50 text-orange-700',
    available: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
    'checked-out': 'border border-[#e2e8f0] bg-[#e2e8f0] text-[#64748b]',
  }
  return <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-semibold ${map[normalized] || 'border border-[#e2e8f0] bg-[#e2e8f0] text-[#173b63]'}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{status}</span>
}

export function Avatar({ name, size = '' }) {
  const initials = name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  return <span className={`grid place-items-center rounded-full bg-[#94a3b8] text-[#173b63] font-bold ${size === 'small' ? 'h-[25px] w-[25px] text-[8px]' : 'h-[31px] w-[31px] text-[9px]'}`}>{initials}</span>
}

export function ActivityChart() {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-[#e2e8f0] p-3" aria-label="Borrowing activity over the last seven months">
      <div className="mb-2 flex justify-between text-[10px] text-[#64748b]"><span>80</span><span>60</span><span>40</span><span>20</span><span>0</span></div>
      <svg className="h-[200px] w-full" viewBox="0 0 700 220" preserveAspectRatio="none" role="img" aria-label="Area chart showing borrowing activity trending upward">
        <defs><linearGradient id="activityFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#94a3b8" stopOpacity=".28" /><stop offset="100%" stopColor="#94a3b8" stopOpacity="0" /></linearGradient></defs>
        {[12, 58, 104, 150, 196].map((y) => <line key={y} x1="0" y1={y} x2="700" y2={y} stroke="#e2e8f0" strokeWidth="1" />)}
        <path d="M0 166 C40 156 54 148 92 153 S145 139 185 143 S238 121 278 127 S330 111 370 119 S423 87 463 100 S515 75 555 81 S616 46 650 58 S682 29 700 35 L700 205 L0 205Z" fill="url(#activityFill)" />
        <path d="M0 166 C40 156 54 148 92 153 S145 139 185 143 S238 121 278 127 S330 111 370 119 S423 87 463 100 S515 75 555 81 S616 46 650 58 S682 29 700 35" fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
        <circle cx="555" cy="81" r="5" fill="#94a3b8" />
      </svg>
      <div className="mt-2 flex justify-between text-[10px] font-medium text-[#64748b]"><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span></div>
    </div>
  )
}

export function DonutChart({ transactions }) {
  const counts = ['Borrowed', 'Returned', 'Overdue'].map((status) => transactions.filter((item) => item.status === status).length)
  const total = counts.reduce((sum, value) => sum + value, 0) || 1
  const circumference = 2 * Math.PI * 60
  const segments = counts.map((count) => (count / total) * circumference)
  const segmentColors = ['stroke-[#173b63]', 'stroke-[#94a3b8]', 'stroke-[#64748b]']
  let offset = 0
  return (
    <div className="mt-5 flex flex-col items-center gap-5 md:flex-row md:items-center md:justify-between">
      <div className="relative grid h-[150px] w-[150px] place-items-center rounded-full">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 160 160" role="img" aria-label="Transaction distribution chart">
          {segments.map((length, index) => {
            const segmentOffset = offset
            offset += length
            return (
              <circle
                key={index}
                cx="80"
                cy="80"
                r="60"
                fill="none"
                strokeWidth="28"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-segmentOffset}
                className={segmentColors[index]}
              />
            )
          })}
        </svg>
        <div className="grid h-[86px] w-[86px] place-items-center rounded-full bg-[#f8fafc] text-center shadow-inner">
          <strong className="text-xl font-bold text-[#173b63]">{transactions.length}</strong>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">borrowed</span>
        </div>
      </div>
      <div className="w-full space-y-3">
        {[['Borrowed', counts[0], 'bg-[#173b63]'], ['Returned', counts[1], 'bg-[#94a3b8]'], ['Overdue', counts[2], 'bg-[#d77c65]']].map(([label, count, color]) => (
          <div className="flex items-center justify-between gap-3 text-sm text-[#173b63]" key={label}>
            <div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${color}`} />{label}</div>
            <strong>{count}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Modal({ title, subtitle, onClose, children, wide = false }) {
  useEffect(() => {
    const onKeyDown = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#173b63]/45 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`w-full max-w-[560px] rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-5 shadow-[0_24px_80px_rgba(15,23,42,0.22)] ${wide ? 'max-w-[720px]' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold text-[#173b63]">{title}</h2>{subtitle && <p className="mt-1 text-sm text-[#64748b]">{subtitle}</p>}</div><button className="inline-grid h-9 w-9 place-items-center rounded-md text-[#64748b] transition hover:bg-[#e2e8f0] hover:text-[#173b63]" onClick={onClose} aria-label="Close dialog"><X size={18} /></button></div>
        {children}
      </section>
    </div>
  )
}

export function RecordForm({ kind, record, onSave, onClose }) {
  const [form, setForm] = useState(record || (kind === 'book'
    ? { title: '', author: '', category: 'Fiction', isbn: '', year: new Date().getFullYear(), copies: 1, available: 1, borrowed: 0, tone: 'cover-new' }
    : { id: '', name: '', email: '', course: '', joined: today(), status: 'Active', borrowed: 0 }))
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const isBook = kind === 'book'
  const onSubmit = (event) => {
    event.preventDefault()
    onSave({ ...form, copies: Number(form.copies), available: Number(form.available), year: Number(form.year), borrowed: Number(form.borrowed) })
  }
  return (
    <Modal title={`${record ? 'Edit' : 'Add'} ${isBook ? 'book' : 'borrower'}`} subtitle={isBook ? 'Keep the catalog details up to date.' : 'Create a library member profile.'} onClose={onClose}>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        {!isBook && <label className="text-sm font-medium text-[#173b63]">Student ID<input required value={form.id} onChange={(event) => set('id', event.target.value)} placeholder="NU-2025-0001" className="mt-1 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-sm text-[#173b63] outline-none transition focus:border-[#173b63] focus:bg-[#f8fafc] focus:ring-2 focus:ring-[#173b63]/10" /></label>}
        <label className="text-sm font-medium text-[#173b63] md:col-span-2">{isBook ? 'Book title' : 'Full name'}<input required value={isBook ? form.title : form.name} onChange={(event) => set(isBook ? 'title' : 'name', event.target.value)} placeholder={isBook ? 'Enter book title' : 'Enter full name'} className="mt-1 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-sm text-[#173b63] outline-none transition focus:border-[#173b63] focus:bg-[#f8fafc] focus:ring-2 focus:ring-[#173b63]/10" /></label>
        {isBook ? <>
          <label className="text-sm font-medium text-[#173b63]">Author<input required value={form.author} onChange={(event) => set('author', event.target.value)} placeholder="Author name" className="mt-1 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-sm text-[#173b63] outline-none transition focus:border-[#173b63] focus:bg-[#f8fafc] focus:ring-2 focus:ring-[#173b63]/10" /></label>
          <label className="text-sm font-medium text-[#173b63]">Category<select value={form.category} onChange={(event) => set('category', event.target.value)} className="mt-1 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-sm text-[#173b63] outline-none transition focus:border-[#173b63] focus:bg-[#f8fafc] focus:ring-2 focus:ring-[#173b63]/10">{['Fiction', 'Biography', 'History', 'Lifestyle', 'Mystery', 'Psychology', 'Self Development', 'Technology'].map((category) => <option key={category}>{category}</option>)}</select></label>
          <label className="text-sm font-medium text-[#173b63]">ISBN<input value={form.isbn} onChange={(event) => set('isbn', event.target.value)} placeholder="9780000000000" className="mt-1 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-sm text-[#173b63] outline-none transition focus:border-[#173b63] focus:bg-[#f8fafc] focus:ring-2 focus:ring-[#173b63]/10" /></label>
          <label className="text-sm font-medium text-[#173b63]">Publication year<input type="number" min="1000" max="2099" value={form.year} onChange={(event) => set('year', event.target.value)} className="mt-1 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-sm text-[#173b63] outline-none transition focus:border-[#173b63] focus:bg-[#f8fafc] focus:ring-2 focus:ring-[#173b63]/10" /></label>
          <label className="text-sm font-medium text-[#173b63]">Total copies<input type="number" min="1" value={form.copies} onChange={(event) => { const copies = Number(event.target.value); setForm((current) => ({ ...current, copies, available: Math.min(current.available, copies) })) }} className="mt-1 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-sm text-[#173b63] outline-none transition focus:border-[#173b63] focus:bg-[#f8fafc] focus:ring-2 focus:ring-[#173b63]/10" /></label>
          <label className="text-sm font-medium text-[#173b63]">Available copies<input type="number" min="0" max={form.copies} value={form.available} onChange={(event) => set('available', event.target.value)} className="mt-1 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-sm text-[#173b63] outline-none transition focus:border-[#173b63] focus:bg-[#f8fafc] focus:ring-2 focus:ring-[#173b63]/10" /></label>
        </> : <>
          <label className="text-sm font-medium text-[#173b63]">Email address<input type="email" required value={form.email} onChange={(event) => set('email', event.target.value)} placeholder="student@nu.edu.ph" className="mt-1 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-sm text-[#173b63] outline-none transition focus:border-[#173b63] focus:bg-[#f8fafc] focus:ring-2 focus:ring-[#173b63]/10" /></label>
          <label className="text-sm font-medium text-[#173b63]">Course / program<input required value={form.course} onChange={(event) => set('course', event.target.value)} placeholder="Degree program" className="mt-1 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-sm text-[#173b63] outline-none transition focus:border-[#173b63] focus:bg-[#f8fafc] focus:ring-2 focus:ring-[#173b63]/10" /></label>
          <label className="text-sm font-medium text-[#173b63]">Member since<input type="date" value={form.joined} onChange={(event) => set('joined', event.target.value)} className="mt-1 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-sm text-[#173b63] outline-none transition focus:border-[#173b63] focus:bg-[#f8fafc] focus:ring-2 focus:ring-[#173b63]/10" /></label>
          <label className="text-sm font-medium text-[#173b63]">Account status<select value={form.status} onChange={(event) => set('status', event.target.value)} className="mt-1 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-sm text-[#173b63] outline-none transition focus:border-[#173b63] focus:bg-[#f8fafc] focus:ring-2 focus:ring-[#173b63]/10"><option>Active</option><option>On hold</option></select></label>
        </>}
        <div className="md:col-span-2 mt-2 flex items-center justify-end gap-3 border-t border-[#e2e8f0] pt-4"><button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2 text-sm font-semibold text-[#173b63] transition hover:border-[#94a3b8] hover:bg-[#f8fafc]" onClick={onClose}>Cancel</button><button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#173b63] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173b63]"><Check size={15} />Save {isBook ? 'book' : 'borrower'}</button></div>
      </form>
    </Modal>
  )
}

export function IssueForm({ borrowers, books, onSave, onClose }) {
  const eligible = borrowers.filter((borrower) => borrower.status === 'Active')
  const available = books.filter((book) => book.available > 0)
  const [borrowerId, setBorrowerId] = useState(eligible[0]?.id || '')
  const [bookId, setBookId] = useState(available[0]?.id || '')
  return (
    <Modal title="Issue a book" subtitle="Record this book as borrowed and set its due date." onClose={onClose}>
      <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); onSave(borrowerId, bookId) }}>
        <label className="text-sm font-medium text-[#173b63]">Borrower<select required value={borrowerId} onChange={(event) => setBorrowerId(event.target.value)} className="mt-1 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-sm text-[#173b63] outline-none transition focus:border-[#173b63] focus:bg-[#f8fafc] focus:ring-2 focus:ring-[#173b63]/10">{eligible.map((borrower) => <option key={borrower.id} value={borrower.id}>{borrower.name} · {borrower.id}</option>)}</select></label>
        <label className="text-sm font-medium text-[#173b63]">Book<select required value={bookId} onChange={(event) => setBookId(event.target.value)} className="mt-1 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-sm text-[#173b63] outline-none transition focus:border-[#173b63] focus:bg-[#f8fafc] focus:ring-2 focus:ring-[#173b63]/10">{available.map((book) => <option key={book.id} value={book.id}>{book.title} · {book.available} available</option>)}</select></label>
        {(!eligible.length || !available.length) && <p className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700"><AlertCircle size={15} />{!eligible.length ? 'Add an active borrower before issuing a book.' : 'No books are currently available to issue.'}</p>}
        <div className="mt-2 flex items-center justify-end gap-3 border-t border-[#e2e8f0] pt-4"><button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2 text-sm font-semibold text-[#173b63] transition hover:border-[#94a3b8] hover:bg-[#f8fafc]" onClick={onClose}>Cancel</button><button disabled={!eligible.length || !available.length} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#173b63] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173b63] disabled:cursor-not-allowed disabled:opacity-45"><Plus size={15} />Record borrowing</button></div>
      </form>
    </Modal>
  )
}

export function ConfirmDialog({ title, message, onConfirm, onClose }) {
  return <Modal title={title} onClose={onClose}><p className="mt-1 text-sm leading-6 text-[#173b63]">{message}</p><div className="mt-5 flex items-center justify-end gap-3"><button className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2 text-sm font-semibold text-[#173b63] transition hover:border-[#94a3b8] hover:bg-[#f8fafc]" onClick={onClose}>Cancel</button><button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#bd5a4e] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a94a3f]" onClick={onConfirm}><Trash2 size={15} />Delete</button></div></Modal>
}

export function TransactionTable({ transactions, limit, onReturn, showBorrowerColumn = true }) {
  const rows = limit ? transactions.slice(0, limit) : transactions
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#e2e8f0] bg-[#f8fafc]"><table className="min-w-full text-left text-sm text-[#173b63]"><thead className="bg-[#f8fafc] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#64748b]"><tr>{showBorrowerColumn && <th className="px-4 py-3">Borrower</th>}<th className="px-4 py-3">Book title</th><th className="px-4 py-3">Issued</th><th className="px-4 py-3">Due date</th><th className="px-4 py-3">Status</th>{onReturn && <th className="px-4 py-3" />}</tr></thead><tbody>
      {rows.map((transaction) => <tr key={transaction.id} className="border-t border-[#e2e8f0] align-middle">
        {showBorrowerColumn && <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar name={transaction.borrower} /><div><strong className="block text-sm font-semibold text-[#173b63]">{transaction.borrower}</strong><span className="text-xs text-[#64748b]">{transaction.id}</span></div></div></td>}
        <td className="px-4 py-3 text-[#173b63]">{transaction.title}</td><td className="px-4 py-3">{formatDate(transaction.issued)}</td><td className="px-4 py-3">{formatDate(transaction.due)}</td><td className="px-4 py-3"><StatusPill status={transaction.status} /></td>
        {onReturn && <td className="px-4 py-3"><button className="text-sm font-semibold text-[#173b63] hover:text-[#173b63]" onClick={() => onReturn(transaction)}>Return</button></td>}
      </tr>)}
      {!rows.length && <tr><td colSpan={onReturn ? (showBorrowerColumn ? 6 : 5) : (showBorrowerColumn ? 5 : 4)} className="px-4 py-8 text-center text-sm text-[#64748b]">No transactions match this view.</td></tr>}
    </tbody></table></div>
  )
}
