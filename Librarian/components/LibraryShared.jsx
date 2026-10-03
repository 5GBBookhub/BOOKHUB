import { useEffect } from 'react'
import { AlertCircle, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, MoreHorizontal, Plus, Search, Trash2, X } from 'lucide-react'
import { daysLate, formatDate, hashPassword, money, normalizeEmail, today } from '../lib/helpers.js'

export function CoverArt({ book, compact = false }) {
  return (
    <div className={`book-cover ${book.tone || 'cover-new'} ${compact ? 'book-cover-compact' : ''}`} aria-label={`Cover artwork for ${book.title}`}>
      <span className="cover-kicker">NU LIBRARY · {book.category.toUpperCase()}</span>
      <span className="cover-motif" />
      <span className="cover-title">{book.title}</span>
      <span className="cover-author">{book.author}</span>
      <span className="cover-seal">NU</span>
    </div>
  )
}

export function StatusPill({ status }) {
  const normalized = status.toLowerCase().replaceAll(' ', '-')
  return <span className={`status-pill status-${normalized}`}><span className="status-dot" />{status}</span>
}

export function Avatar({ name, size = '' }) {
  const initials = name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  return <span className={`avatar ${size}`}>{initials}</span>
}

export function ActivityChart() {
  return (
    <div className="activity-chart" aria-label="Borrowing activity over the last seven months">
      <div className="chart-y-labels"><span>80</span><span>60</span><span>40</span><span>20</span><span>0</span></div>
      <svg className="activity-svg" viewBox="0 0 700 220" preserveAspectRatio="none" role="img" aria-label="Area chart showing borrowing activity trending upward">
        <defs><linearGradient id="activityFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#d7a92e" stopOpacity=".28" /><stop offset="100%" stopColor="#d7a92e" stopOpacity="0" /></linearGradient></defs>
        {[12, 58, 104, 150, 196].map((y) => <line key={y} x1="0" y1={y} x2="700" y2={y} className="chart-gridline" />)}
        <path d="M0 166 C40 156 54 148 92 153 S145 139 185 143 S238 121 278 127 S330 111 370 119 S423 87 463 100 S515 75 555 81 S616 46 650 58 S682 29 700 35 L700 205 L0 205Z" fill="url(#activityFill)" />
        <path d="M0 166 C40 156 54 148 92 153 S145 139 185 143 S238 121 278 127 S330 111 370 119 S423 87 463 100 S515 75 555 81 S616 46 650 58 S682 29 700 35" className="chart-line" />
        <circle cx="555" cy="81" r="5" className="chart-point" />
      </svg>
      <div className="chart-x-labels"><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span></div>
    </div>
  )
}

export function DonutChart({ transactions }) {
  const counts = ['Borrowed', 'Returned', 'Overdue'].map((status) => transactions.filter((item) => item.status === status).length)
  const total = counts.reduce((sum, value) => sum + value, 0) || 1
  const borrowed = (counts[0] / total) * 100
  const returned = (counts[1] / total) * 100
  return (
    <div className="donut-wrap">
      <div className="donut-chart" style={{ background: `conic-gradient(#173b63 0 ${borrowed}%, #d7a92e ${borrowed}% ${borrowed + returned}%, #d77c65 ${borrowed + returned}% 100%)` }}>
        <div className="donut-hole"><strong>{transactions.length}</strong><span>loans</span></div>
      </div>
      <div className="donut-legend">
        {[['Borrowed', counts[0], 'navy'], ['Returned', counts[1], 'gold'], ['Overdue', counts[2], 'coral']].map(([label, count, color]) => (
          <div className="legend-item" key={label}><span className={`legend-swatch ${color}`} /><span>{label}</span><strong>{count}</strong></div>
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
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={18} /></button></div>
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
      <form className="form-grid" onSubmit={onSubmit}>
        {!isBook && <label>Student ID<input required value={form.id} onChange={(event) => set('id', event.target.value)} placeholder="NU-2025-0001" /></label>}
        <label className="field-span">{isBook ? 'Book title' : 'Full name'}<input required value={isBook ? form.title : form.name} onChange={(event) => set(isBook ? 'title' : 'name', event.target.value)} placeholder={isBook ? 'Enter book title' : 'Enter full name'} /></label>
        {isBook ? <>
          <label>Author<input required value={form.author} onChange={(event) => set('author', event.target.value)} placeholder="Author name" /></label>
          <label>Category<select value={form.category} onChange={(event) => set('category', event.target.value)}>{['Fiction', 'Biography', 'History', 'Lifestyle', 'Mystery', 'Psychology', 'Self Development', 'Technology'].map((category) => <option key={category}>{category}</option>)}</select></label>
          <label>ISBN<input value={form.isbn} onChange={(event) => set('isbn', event.target.value)} placeholder="9780000000000" /></label>
          <label>Publication year<input type="number" min="1000" max="2099" value={form.year} onChange={(event) => set('year', event.target.value)} /></label>
          <label>Total copies<input type="number" min="1" value={form.copies} onChange={(event) => { const copies = Number(event.target.value); setForm((current) => ({ ...current, copies, available: Math.min(current.available, copies) })) }} /></label>
          <label>Available copies<input type="number" min="0" max={form.copies} value={form.available} onChange={(event) => set('available', event.target.value)} /></label>
        </> : <>
          <label>Email address<input type="email" required value={form.email} onChange={(event) => set('email', event.target.value)} placeholder="student@nu.edu.ph" /></label>
          <label>Course / program<input required value={form.course} onChange={(event) => set('course', event.target.value)} placeholder="Degree program" /></label>
          <label>Member since<input type="date" value={form.joined} onChange={(event) => set('joined', event.target.value)} /></label>
          <label>Account status<select value={form.status} onChange={(event) => set('status', event.target.value)}><option>Active</option><option>On hold</option></select></label>
        </>}
        <div className="form-actions field-span"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary"><Check size={15} />Save {isBook ? 'book' : 'borrower'}</button></div>
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
    <Modal title="Issue a book" subtitle="Create a new loan and set its due date." onClose={onClose}>
      <form className="form-grid" onSubmit={(event) => { event.preventDefault(); onSave(borrowerId, bookId) }}>
        <label className="field-span">Borrower<select required value={borrowerId} onChange={(event) => setBorrowerId(event.target.value)}>{eligible.map((borrower) => <option key={borrower.id} value={borrower.id}>{borrower.name} · {borrower.id}</option>)}</select></label>
        <label className="field-span">Book<select required value={bookId} onChange={(event) => setBookId(event.target.value)}>{available.map((book) => <option key={book.id} value={book.id}>{book.title} · {book.available} available</option>)}</select></label>
        {(!eligible.length || !available.length) && <p className="inline-warning field-span"><AlertCircle size={15} />{!eligible.length ? 'Add an active borrower before issuing a loan.' : 'No books are currently available to issue.'}</p>}
        <div className="form-actions field-span"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button disabled={!eligible.length || !available.length} className="button button-primary"><Plus size={15} />Create loan</button></div>
      </form>
    </Modal>
  )
}

export function ConfirmDialog({ title, message, onConfirm, onClose }) {
  return <Modal title={title} onClose={onClose}><p className="confirm-copy">{message}</p><div className="form-actions"><button className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-danger" onClick={onConfirm}><Trash2 size={15} />Delete</button></div></Modal>
}

export function TransactionTable({ transactions, limit, onReturn }) {
  const rows = limit ? transactions.slice(0, limit) : transactions
  return (
    <div className="table-scroll"><table><thead><tr><th>Borrower</th><th>Book title</th><th>Issued</th><th>Due date</th><th>Status</th>{onReturn && <th />}</tr></thead><tbody>
      {rows.map((transaction) => <tr key={transaction.id}>
        <td><div className="person-cell"><Avatar name={transaction.borrower} /><div><strong>{transaction.borrower}</strong><span>{transaction.id}</span></div></div></td>
        <td className="book-cell">{transaction.title}</td><td>{formatDate(transaction.issued)}</td><td>{formatDate(transaction.due)}</td><td><StatusPill status={transaction.status} /></td>
        {onReturn && <td>{transaction.status !== 'Returned' && <button className="text-action" onClick={() => onReturn(transaction)}>Return</button>}</td>}
      </tr>)}
      {!rows.length && <tr><td colSpan={onReturn ? 6 : 5} className="empty-cell">No transactions match this view.</td></tr>}
    </tbody></table></div>
  )
}
