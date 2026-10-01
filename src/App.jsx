import { useEffect, useMemo, useState } from 'react'
import {
  Activity, AlertCircle, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Bell,
  BookCopy, BookOpen, Bookmark, CalendarDays, Check, CheckCircle2, ChevronDown,
  ChevronLeft, ChevronRight, CircleHelp, Clock3, Download, FileBarChart2,
  Filter, LayoutDashboard, LibraryBig, LogOut, Menu, MoreHorizontal, Plus,
  Search, Settings, ShieldCheck, SlidersHorizontal, Sparkles, Trash2, TrendingUp,
  UserRound, UserRoundCog, Users, X,
} from 'lucide-react'
import {
  initialBooks, initialBorrowers, initialSettings, initialStaff, initialTransactions,
} from './data.js'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, section: 'dashboard' },
  { label: 'Books', icon: BookOpen, section: 'books' },
  { label: 'Borrowers', icon: Users, section: 'borrowers' },
  { label: 'Circulation', icon: BookCopy, section: 'circulation' },
  { label: 'Reports', icon: FileBarChart2, section: 'reports' },
]
const adminItems = [
  { label: 'Users & staff', icon: UserRoundCog, section: 'staff' },
  { label: 'Settings', icon: Settings, section: 'settings' },
]
const memberItems = [
  { label: 'Book catalog', icon: BookOpen, section: 'books' },
  { label: 'My account', icon: UserRound, section: 'my-account' },
]
const roleOptions = [
  { value: 'admin', label: 'Admin', description: 'Full system access', icon: ShieldCheck },
  { value: 'librarian', label: 'Librarian', description: 'Library operations', icon: BookOpen },
  { value: 'student', label: 'Student', description: 'Browse and track loans', icon: UserRound },
  { value: 'employee', label: 'Employee', description: 'Browse and track loans', icon: Users },
]
const titles = {
  dashboard: 'Good morning, Leona', books: 'Book catalog', borrowers: 'Borrowers',
  circulation: 'Circulation desk', reports: 'Library reports', staff: 'Users & staff',
  settings: 'Settings', 'my-account': 'My account',
}
const today = () => new Date().toISOString().slice(0, 10)
const formatDate = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const money = (value) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value || 0)
const daysLate = (due) => Math.max(0, Math.floor((new Date(`${today()}T00:00:00`) - new Date(`${due}T00:00:00`)) / 86400000))
const normalizeEmail = (email) => email.trim().toLowerCase()

async function hashPassword(password, saltHex = null) {
  const salt = saltHex ? Uint8Array.from(saltHex.match(/.{2}/g), (byte) => parseInt(byte, 16)) : crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' }, key, 256)
  const passwordHash = [...new Uint8Array(derived)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  const passwordSalt = [...salt].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  return { passwordHash, passwordSalt }
}

async function verifyPassword(password, account) {
  if (!account?.passwordHash || !account.passwordSalt) return false
  const result = await hashPassword(password, account.passwordSalt)
  return result.passwordHash === account.passwordHash
}

function useStoredState(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : fallback
    } catch {
      return fallback
    }
  })
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  return [value, setValue]
}

function LoginScreen({ onLogin, onCreateAccount }) {
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [course, setCourse] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const selectedRole = roleOptions.find((item) => item.value === role)
  const canRegister = role === 'student' || role === 'employee'
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!role) return setError('Choose an account type to continue.')
    if (mode === 'signup' && password !== confirmPassword) return setError('The passwords do not match.')
    setBusy(true)
    try {
      if (mode === 'signup') await onCreateAccount({ role, email, password, name, course })
      else await onLogin(role, email, password)
    } catch (authError) {
      setError(authError.message || 'We could not complete that request.')
    } finally {
      setBusy(false)
    }
  }
  const chooseRole = (value) => {
    setRole(value)
    setError('')
    if (value === 'admin' && !email) setEmail('admin@lrc.ph')
    else if (role === 'admin' && email === 'admin@lrc.ph' && value !== 'admin') setEmail('')
    if (value !== 'student' && value !== 'employee') setMode('login')
  }
  return (
    <main className="login-page">
      <aside className="login-aside">
        <button className="login-brand" type="button" onClick={() => setRole('')}><span className="brand-mark"><BookOpen size={21} /></span><span className="brand-name">BOOK<span>HUB</span><small>NU LIBRARY SYSTEM</small></span></button>
        <div className="login-aside-copy"><span className="eyebrow">NATIONAL UNIVERSITY · LIBRARY</span><h1>A good place to begin.</h1><p>One thoughtful space for the books, people, and ideas that make our campus.</p><div className="login-aside-rule"><span /><span /><span /></div></div>
        <div className="login-aside-art"><LibraryBig size={180} strokeWidth={0.7} /><span className="art-ring ring-one" /><span className="art-ring ring-two" /><span className="art-gold-line" /></div>
        <span className="login-aside-footer">KNOWLEDGE IN MOTION · EST. 1900</span>
      </aside>
      <section className="login-main">
        <div className="login-form-wrap">
          <span className="eyebrow">BOOKHUB ACCOUNT</span>
          <h2>{mode === 'signup' ? 'Create your account.' : 'Welcome back.'}</h2>
          <p className="login-description">{mode === 'signup' ? 'Join the library as a student or employee.' : 'Choose your account type to continue.'}</p>
          <div className="role-grid" role="group" aria-label="Choose account type">
            {roleOptions.map(({ value, label, description, icon: Icon }) => <button key={value} type="button" className={`role-option ${role === value ? 'role-selected' : ''}`} aria-pressed={role === value} onClick={() => chooseRole(value)}><span className="role-icon"><Icon size={17} /></span><span className="role-copy"><strong>{label}</strong><small>{description}</small></span>{role === value && <CheckCircle2 className="role-check" size={16} />}</button>)}
          </div>
          <form className="login-form" onSubmit={submit}>
            {mode === 'signup' && <><label>Full name<input autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" /></label><label>{role === 'student' ? 'Course / program' : 'Department'}<input required value={course} onChange={(event) => setCourse(event.target.value)} placeholder={role === 'student' ? 'e.g. BS Information Technology' : 'e.g. Faculty of Computing'} /></label></>}
            <label>Email address<input type="email" autoComplete="username" required placeholder="name@nu.edu.ph" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <label>Password<span className="password-field"><input type={showPassword ? 'text' : 'password'} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={8} required placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'} value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Hide' : 'Show'}</button></span></label>
            {mode === 'signup' && <label>Confirm password<input type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} required placeholder="Enter password again" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>}
            {mode === 'login' && <div className="login-form-meta"><label className="remember-check"><input type="checkbox" />Keep me signed in</label><button type="button" className="text-action" onClick={() => setError('Please contact the library administrator to reset your password.')}>Forgot password?</button></div>}
            {error && <p className="auth-error" role="alert"><AlertCircle size={15} />{error}</p>}
            <button className="button button-primary login-submit" disabled={!selectedRole || busy}><span>{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : `Sign in as ${selectedRole?.label || '…'}`}</span><ArrowRight size={16} /></button>
          </form>
          {canRegister && <p className="signup-switch">{mode === 'signup' ? 'Already have an account?' : 'New to BOOKHUB?'} <button type="button" onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError('') }}>{mode === 'signup' ? 'Sign in' : 'Create an account'}</button></p>}
          <p className="demo-auth-note"><ShieldCheck size={14} />Demo accounts are stored in this browser. Connect a trusted auth service before using real credentials.</p>
          <div className="login-footnote"><span>© 2026 National University</span><span>Help desk <ArrowUpRight size={12} /></span></div>
        </div>
      </section>
    </main>
  )
}

function CoverArt({ book, compact = false }) {
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

function StatusPill({ status }) {
  const normalized = status.toLowerCase().replaceAll(' ', '-')
  return <span className={`status-pill status-${normalized}`}><span className="status-dot" />{status}</span>
}

function Avatar({ name, size = '' }) {
  const initials = name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  return <span className={`avatar ${size}`}>{initials}</span>
}

function ActivityChart() {
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

function DonutChart({ transactions }) {
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

function Modal({ title, subtitle, onClose, children, wide = false }) {
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

function RecordForm({ kind, record, onSave, onClose }) {
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

function IssueForm({ borrowers, books, onSave, onClose }) {
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

function ConfirmDialog({ title, message, onConfirm, onClose }) {
  return <Modal title={title} onClose={onClose}><p className="confirm-copy">{message}</p><div className="form-actions"><button className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-danger" onClick={onConfirm}><Trash2 size={15} />Delete</button></div></Modal>
}

function TransactionTable({ transactions, limit, onReturn }) {
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

function Dashboard({ books, borrowers, transactions, onNavigate }) {
  const activeLoans = transactions.filter((item) => item.status !== 'Returned').length
  const overdue = transactions.filter((item) => item.status === 'Overdue' || (item.status === 'Borrowed' && daysLate(item.due) > 0)).length
  const totalCopies = books.reduce((sum, book) => sum + book.copies, 0)
  const topBooks = [...books].sort((a, b) => b.borrowed - a.borrowed).slice(0, 4)
  return (
    <>
      <div className="welcome-strip"><div><span className="eyebrow">DAILY LIBRARY SUMMARY</span><h1>Your library, in good order.</h1><p>Here’s the latest from the National University Library.</p></div><button className="button button-light" onClick={() => onNavigate('circulation')}><Plus size={16} />New loan</button><div className="welcome-mark"><LibraryBig size={74} strokeWidth={1} /></div></div>
      <section className="stats-grid">
        <StatCard label="Total book copies" value={totalCopies.toLocaleString()} change="Across the catalog" icon={BookOpen} color="blue" onClick={() => onNavigate('books')} />
        <StatCard label="Currently borrowed" value={activeLoans} change="Active loans" icon={BookCopy} color="gold" onClick={() => onNavigate('circulation')} />
        <StatCard label="Active borrowers" value={borrowers.filter((item) => item.status === 'Active').length} change="Registered members" icon={Users} color="green" onClick={() => onNavigate('borrowers')} />
        <StatCard label="Overdue items" value={overdue} change={overdue ? 'Needs attention' : 'All caught up'} icon={Clock3} color="coral" onClick={() => onNavigate('circulation')} alert={overdue > 0} />
      </section>
      <section className="dashboard-charts">
        <div className="panel activity-panel"><div className="panel-heading"><div><span className="eyebrow">LIBRARY PULSE</span><h2>Borrowing activity</h2></div><button className="select-button">Last 7 months <ChevronDown size={14} /></button></div><div className="activity-summary"><strong>1,284</strong><span>books checked out</span><span className="trend-up"><TrendingUp size={14} />12.8%</span></div><ActivityChart /></div>
        <div className="panel status-panel"><div className="panel-heading"><div><span className="eyebrow">AT A GLANCE</span><h2>Transaction status</h2></div><button className="icon-button" aria-label="Transaction status details"><MoreHorizontal size={19} /></button></div><DonutChart transactions={transactions} /><button className="panel-link" onClick={() => onNavigate('circulation')}>View all transactions <ArrowRight size={14} /></button></div>
      </section>
      <section className="dashboard-lower">
        <div className="panel recent-panel"><div className="panel-heading"><div><span className="eyebrow">THE LATEST</span><h2>Recent transactions</h2></div><button className="panel-link" onClick={() => onNavigate('circulation')}>See all <ArrowRight size={14} /></button></div><TransactionTable transactions={transactions} limit={5} /></div>
        <div className="panel popular-panel"><div className="panel-heading"><div><span className="eyebrow">READER FAVORITES</span><h2>Most borrowed</h2></div><button className="icon-button" aria-label="More most borrowed actions"><MoreHorizontal size={19} /></button></div><div className="popular-list">{topBooks.map((book, index) => <button className="popular-book" key={book.id} onClick={() => onNavigate('books', book)}><span className="rank">0{index + 1}</span><CoverArt book={book} compact /><span className="popular-copy"><strong>{book.title}</strong><span>{book.author}</span></span><span className="borrow-count">{book.borrowed}<small>loans</small></span></button>)}</div></div>
      </section>
    </>
  )
}

function StatCard({ label, value, change, icon: Icon, color, onClick, alert }) {
  return <button className="stat-card" onClick={onClick}><span className={`stat-icon ${color}`}><Icon size={19} /></span><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className={`stat-note ${alert ? 'note-alert' : ''}`}>{alert && <AlertCircle size={13} />}{change}</span><ArrowUpRight className="stat-arrow" size={16} /></button>
}

function BooksPage({ books, setBooks, onToast, onOpenBook, initialQuery = '', readOnly = false }) {
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState('All categories')
  const [availability, setAvailability] = useState('Any availability')
  const [sort, setSort] = useState('Recently added')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const pageSize = 8
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()
    return books.filter((book) => (!search || `${book.title} ${book.author} ${book.id} ${book.isbn}`.toLowerCase().includes(search))
      && (category === 'All categories' || book.category === category)
      && (availability === 'Any availability' || (availability === 'Available' ? book.available > 0 : book.available === 0)))
      .sort((a, b) => sort === 'Title A–Z' ? a.title.localeCompare(b.title) : sort === 'Most borrowed' ? b.borrowed - a.borrowed : b.id.localeCompare(a.id))
  }, [books, query, category, availability, sort])
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)
  const saveBook = (book) => {
    setBooks((current) => modal.record ? current.map((item) => item.id === modal.record.id ? book : item) : [{ ...book, id: `BK-${Date.now().toString().slice(-4)}` }, ...current])
    setModal(null)
    onToast(modal.record ? 'Book details updated' : 'Book added to the catalog')
  }
  return (
    <>
      <div className="page-intro"><div><p>{readOnly ? 'Browse the collection and check which titles are available.' : 'Manage titles, copies, and availability across the collection.'}</p></div>{!readOnly && <button className="button button-primary" onClick={() => setModal({ kind: 'book' })}><Plus size={16} />Add a book</button>}</div>
      <section className={`panel catalog-panel ${readOnly ? 'catalog-read-only' : ''}`}>
        <div className="toolbar"><label className="search-field"><Search size={16} /><input placeholder="Search title, author, ISBN…" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} /><kbd>⌘ K</kbd></label><label className="filter-select"><Filter size={15} /><select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1) }}><option>All categories</option>{[...new Set(books.map((book) => book.category))].sort().map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label><label className="filter-select"><select value={availability} onChange={(event) => { setAvailability(event.target.value); setPage(1) }}><option>Any availability</option><option>Available</option><option>Out of stock</option></select><ChevronDown size={14} /></label><label className="filter-select sort-filter"><SlidersHorizontal size={15} /><select value={sort} onChange={(event) => setSort(event.target.value)}><option>Recently added</option><option>Title A–Z</option><option>Most borrowed</option></select><ChevronDown size={14} /></label></div>
        <div className="catalog-grid">{visible.map((book) => <article className="catalog-card" key={book.id}><button className="cover-button" onClick={() => onOpenBook(book)}><CoverArt book={book} /></button><div className="catalog-card-body"><span className="category-label">{book.category}</span><button className="book-title-link" onClick={() => onOpenBook(book)}>{book.title}</button><p>{book.author}</p><div className="catalog-card-foot"><span className={`availability ${book.available ? '' : 'unavailable'}`}><i />{book.available ? `${book.available} of ${book.copies} available` : 'All copies borrowed'}</span><button className="icon-button small" aria-label={`Edit ${book.title}`} onClick={() => setModal({ kind: 'book', record: book })}><MoreHorizontal size={17} /></button></div><div className="card-hover-actions"><button onClick={() => setModal({ kind: 'book', record: book })}>Edit</button><button onClick={() => setDeleting(book)}>Delete</button></div></div></article>)}</div>
        {!visible.length && <div className="empty-state"><Search size={24} /><strong>No books found</strong><span>Try adjusting your search or filters.</span></div>}
        <div className="pagination"><span>Showing <strong>{filtered.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)}</strong> of <strong>{filtered.length}</strong> titles</span><div><button className="icon-button small" disabled={page === 1} aria-label="Previous page" onClick={() => setPage((current) => current - 1)}><ChevronLeft size={17} /></button><span className="page-indicator">{page} / {pages}</span><button className="icon-button small" disabled={page === pages} aria-label="Next page" onClick={() => setPage((current) => current + 1)}><ChevronRight size={17} /></button></div></div>
      </section>
      {modal && <RecordForm kind={modal.kind} record={modal.record} onSave={saveBook} onClose={() => setModal(null)} />}
      {deleting && <ConfirmDialog title="Remove this book?" message={`“${deleting.title}” will be removed from the catalog. This action cannot be undone.`} onClose={() => setDeleting(null)} onConfirm={() => { setBooks((current) => current.filter((book) => book.id !== deleting.id)); setDeleting(null); onToast('Book removed from the catalog') }} />}
    </>
  )
}

function BookDetail({ book, onBack, onSaveBook, transactions, canEdit = true }) {
  const [editing, setEditing] = useState(false)
  const history = transactions.filter((item) => item.bookId === book.id).slice(0, 4)
  return <><button className="back-link" onClick={onBack}><ArrowLeft size={15} />Back to catalog</button><section className="panel detail-panel"><div className="detail-cover"><CoverArt book={book} /></div><div className="detail-content"><span className="category-label">{book.category}</span><h1>{book.title}</h1><p className="detail-author">by {book.author}</p><div className="detail-tags"><StatusPill status={book.available ? 'Available' : 'Checked out'} /><span>{book.available} available of {book.copies} copies</span></div><div className="detail-meta"><div><span>Catalog ID</span><strong>{book.id}</strong></div><div><span>ISBN</span><strong>{book.isbn || 'Not listed'}</strong></div><div><span>Published</span><strong>{book.year}</strong></div><div><span>Total checkouts</span><strong>{book.borrowed}</strong></div></div>{canEdit && <button className="button button-primary" onClick={() => setEditing(true)}><Settings size={15} />Edit book details</button>}</div></section><section className="panel history-panel"><div className="panel-heading"><div><span className="eyebrow">CIRCULATION</span><h2>Recent loan history</h2></div></div><TransactionTable transactions={history} /></section>{editing && <RecordForm kind="book" record={book} onSave={(updated) => { onSaveBook(updated); setEditing(false) }} onClose={() => setEditing(false)} />}</>
}

function BorrowersPage({ borrowers, setBorrowers, transactions, onToast }) {
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const visible = borrowers.filter((borrower) => `${borrower.name} ${borrower.id} ${borrower.email} ${borrower.course}`.toLowerCase().includes(query.toLowerCase()))
  const save = (record) => { setBorrowers((current) => editing ? current.map((item) => item.id === editing.id ? record : item) : [record, ...current]); setModal(false); setEditing(null); onToast(editing ? 'Borrower profile updated' : 'Borrower added') }
  return <><div className="page-intro"><p>Manage member profiles and keep track of their activity.</p><button className="button button-primary" onClick={() => { setEditing(null); setModal(true) }}><Plus size={16} />Add borrower</button></div><section className="panel table-panel"><div className="toolbar"><label className="search-field"><Search size={16} /><input placeholder="Search name, student ID, or email…" value={query} onChange={(event) => setQuery(event.target.value)} /></label><span className="table-count">{visible.length} members</span></div><div className="table-scroll"><table><thead><tr><th>Borrower</th><th>Student ID</th><th>Program</th><th>Books out</th><th>Member since</th><th>Status</th><th /></tr></thead><tbody>{visible.map((borrower) => <tr key={borrower.id}><td><div className="person-cell"><Avatar name={borrower.name} /><div><strong>{borrower.name}</strong><span>{borrower.email}</span></div></div></td><td>{borrower.id}</td><td>{borrower.course}</td><td><strong>{transactions.filter((item) => item.borrowerId === borrower.id && item.status !== 'Returned').length}</strong></td><td>{formatDate(borrower.joined)}</td><td><StatusPill status={borrower.status} /></td><td><div className="row-actions"><button className="icon-button small" aria-label={`Edit ${borrower.name}`} onClick={() => { setEditing(borrower); setModal(true) }}><Settings size={15} /></button><button className="icon-button small danger-icon" aria-label={`Delete ${borrower.name}`} onClick={() => setDeleting(borrower)}><Trash2 size={15} /></button></div></td></tr>)}{!visible.length && <tr><td colSpan="7" className="empty-cell">No borrowers found.</td></tr>}</tbody></table></div></section>{modal && <RecordForm kind="borrower" record={editing} onSave={save} onClose={() => setModal(false)} />}{deleting && <ConfirmDialog title="Delete borrower?" message={`Remove ${deleting.name} (${deleting.id}) from the borrower list? Existing transaction history will be kept.`} onClose={() => setDeleting(null)} onConfirm={() => { setBorrowers((current) => current.filter((item) => item.id !== deleting.id)); setDeleting(null); onToast('Borrower removed') }} />}</>
}

function CirculationPage({ books, setBooks, borrowers, transactions, setTransactions, settings, onToast }) {
  const [tab, setTab] = useState('All transactions')
  const [query, setQuery] = useState('')
  const [issuing, setIssuing] = useState(false)
  const [returning, setReturning] = useState(null)
  const loanRows = transactions.filter((item) => item.status !== 'Returned')
  const overdueRows = loanRows.filter((item) => item.status === 'Overdue' || daysLate(item.due) > 0)
  const source = tab === 'Overdue' ? overdueRows : tab === 'Returns' ? transactions.filter((item) => item.status === 'Returned') : transactions
  const filtered = source.filter((item) => `${item.borrower} ${item.title} ${item.id}`.toLowerCase().includes(query.toLowerCase()))
  const issue = (borrowerId, bookId) => {
    const borrower = borrowers.find((item) => item.id === borrowerId)
    const book = books.find((item) => item.id === bookId)
    const currentLoans = transactions.filter((item) => item.borrowerId === borrowerId && item.status !== 'Returned').length
    if (currentLoans >= Number(settings.maxBooks)) {
      onToast(`${borrower.name} has reached the ${settings.maxBooks}-book limit`)
      return
    }
    if (!book || book.available < 1) {
      onToast('That title is no longer available')
      return
    }
    const due = new Date(Date.now() + Number(settings.loanDays) * 86400000).toISOString().slice(0, 10)
    const transaction = { id: `TRX-${String(Date.now()).slice(-4)}`, borrowerId, borrower: borrower.name, bookId, title: book.title, issued: today(), due, status: 'Borrowed', fine: 0 }
    setTransactions((current) => [transaction, ...current])
    setBooks((current) => current.map((item) => item.id === bookId ? { ...item, available: item.available - 1, borrowed: item.borrowed + 1 } : item))
    setIssuing(false)
    onToast(`Loan created for ${borrower.name}`)
  }
  const completeReturn = (transaction) => {
    const late = daysLate(transaction.due)
    const fine = late * Number(settings.fineRate)
    setTransactions((current) => current.map((item) => item.id === transaction.id ? { ...item, status: 'Returned', returned: today(), fine } : item))
    setBooks((current) => current.map((item) => item.id === transaction.bookId ? { ...item, available: Math.min(item.copies, item.available + 1) } : item))
    setReturning(null)
    onToast(late ? `Return recorded · ${money(fine)} fine due` : 'Return recorded successfully')
  }
  return <><div className="page-intro"><p>Issue loans, process returns, and follow up on overdue books.</p><button className="button button-primary" onClick={() => setIssuing(true)}><Plus size={16} />Issue a book</button></div><section className="circulation-summary"><div className="mini-summary"><span className="stat-icon blue"><BookCopy size={18} /></span><div><span>On loan</span><strong>{loanRows.length}</strong></div></div><div className="mini-summary"><span className="stat-icon coral"><Clock3 size={18} /></span><div><span>Overdue</span><strong>{overdueRows.length}</strong></div></div><div className="mini-summary"><span className="stat-icon green"><CheckCircle2 size={18} /></span><div><span>Returned</span><strong>{transactions.filter((item) => item.status === 'Returned').length}</strong></div></div></section><section className="panel table-panel"><div className="circulation-toolbar"><div className="segmented-control">{['All transactions', 'Returns', 'Overdue'].map((item) => <button className={tab === item ? 'selected' : ''} key={item} onClick={() => setTab(item)}>{item}{item === 'Overdue' && overdueRows.length > 0 && <span className="tab-count">{overdueRows.length}</span>}</button>)}</div><label className="search-field circulation-search"><Search size={16} /><input placeholder="Search transactions…" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>{tab === 'Overdue' ? <div className="table-scroll"><table><thead><tr><th>Borrower</th><th>Book title</th><th>Due date</th><th>Days late</th><th>Fine due</th><th /></tr></thead><tbody>{filtered.map((item) => { const late = daysLate(item.due); return <tr key={item.id}><td><div className="person-cell"><Avatar name={item.borrower} /><div><strong>{item.borrower}</strong><span>{item.borrowerId}</span></div></div></td><td>{item.title}</td><td>{formatDate(item.due)}</td><td><span className="late-count">{late} days</span></td><td><strong>{money(late * Number(settings.fineRate))}</strong></td><td><button className="text-action" onClick={() => setReturning(item)}>Record return</button></td></tr>})}{!filtered.length && <tr><td colSpan="6" className="empty-cell">Nothing overdue. A lovely sight.</td></tr>}</tbody></table></div> : <TransactionTable transactions={filtered} onReturn={tab === 'All transactions' ? setReturning : null} />}</section>{issuing && <IssueForm borrowers={borrowers} books={books} onSave={issue} onClose={() => setIssuing(false)} />}{returning && <Modal title="Record this return?" subtitle="The book will be added back to available inventory." onClose={() => setReturning(null)}><div className="return-summary"><BookOpen size={19} /><div><strong>{returning.title}</strong><span>{returning.borrower} · Due {formatDate(returning.due)}</span></div></div>{daysLate(returning.due) > 0 && <p className="fine-note"><AlertCircle size={15} />{daysLate(returning.due)} days late · {money(daysLate(returning.due) * Number(settings.fineRate))} fine</p>}<div className="form-actions"><button className="button button-quiet" onClick={() => setReturning(null)}>Cancel</button><button className="button button-primary" onClick={() => completeReturn(returning)}><Check size={15} />Confirm return</button></div></Modal>}</>
}

function ReportsPage({ books, transactions }) {
  const topBooks = [...books].sort((a, b) => b.borrowed - a.borrowed).slice(0, 6)
  const categories = [...new Set(books.map((item) => item.category))].map((name) => ({ name, count: books.filter((item) => item.category === name).length })).sort((a, b) => b.count - a.count).slice(0, 6)
  const states = ['Borrowed', 'Returned', 'Overdue'].map((name) => ({ name, count: transactions.filter((item) => item.status === name).length }))
  const max = Math.max(...topBooks.map((item) => item.borrowed), 1)
  return <><div className="page-intro"><p>A clear picture of what your readers love and what needs attention.</p><button className="button button-outline" onClick={() => window.print()}><Download size={15} />Export report</button></div><div className="report-grid"><section className="panel report-panel top-books-report"><div className="panel-heading"><div><span className="eyebrow">COLLECTION ENGAGEMENT</span><h2>Most borrowed titles</h2></div><span className="report-period">All time</span></div><div className="horizontal-bars">{topBooks.map((book) => <div className="bar-row" key={book.id}><span className="bar-name">{book.title}</span><div className="bar-track"><span style={{ width: `${(book.borrowed / max) * 100}%` }} /></div><strong>{book.borrowed}</strong></div>)}</div></section><section className="panel report-panel"><div className="panel-heading"><div><span className="eyebrow">COLLECTION MIX</span><h2>By category</h2></div></div><div className="category-breakdown">{categories.map((item, index) => <div className="category-row" key={item.name}><span className={`category-marker marker-${index}`} /><span>{item.name}</span><strong>{item.count}</strong><span className="category-percent">{Math.round((item.count / books.length) * 100)}%</span></div>)}</div></section><section className="panel report-panel distribution-report"><div className="panel-heading"><div><span className="eyebrow">CIRCULATION SNAPSHOT</span><h2>Transaction distribution</h2></div></div><div className="distribution-content"><DonutChart transactions={transactions} /><div className="distribution-note"><strong>{transactions.length}</strong><span>transactions recorded</span><small>Includes all current demo records.</small></div></div></section><section className="panel report-panel availability-report"><div className="panel-heading"><div><span className="eyebrow">INVENTORY HEALTH</span><h2>Availability by copies</h2></div></div><div className="availability-meter"><div><span>Available</span><strong>{books.reduce((sum, item) => sum + item.available, 0)} <small>copies</small></strong></div><div className="meter-track"><span style={{ width: `${Math.max(4, (books.reduce((sum, item) => sum + item.available, 0) / (books.reduce((sum, item) => sum + item.copies, 0) || 1)) * 100)}%` }} /></div><div className="meter-legend"><span><i className="legend-swatch navy" />Available</span><span><i className="legend-swatch gold" />Checked out</span></div></div></section></div><section className="panel report-table"><div className="panel-heading"><div><span className="eyebrow">TRANSACTION STATUS</span><h2>Circulation counts</h2></div></div><div className="status-report-grid">{states.map((item) => <div className="status-report-item" key={item.name}><StatusPill status={item.name} /><strong>{item.count}</strong><span>records</span></div>)}</div></section></>
}

function StaffPage({ staff, setStaff, onToast }) {
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', role: 'Librarian', password: '' })
  const [formError, setFormError] = useState('')
  const open = (record = null) => {
    setEditing(record)
    setForm(record ? { name: record.name, email: record.email, role: record.role, password: '' } : { name: '', email: '', role: 'Librarian', password: '' })
    setFormError('')
    setModal(true)
  }
  const save = async (event) => {
    event.preventDefault()
    setFormError('')
    const email = normalizeEmail(form.email)
    if (staff.some((member) => member.id !== editing?.id && normalizeEmail(member.email) === email)) {
      setFormError('A staff account already uses this email address.')
      return
    }
    if (!editing && !form.password) {
      setFormError('Set a password before creating this account.')
      return
    }
    const credentials = form.password ? await hashPassword(form.password) : {}
    const account = {
      id: editing?.id || `ST-${String(Date.now()).slice(-4)}`,
      name: form.name.trim(), email, role: form.role, status: editing?.status || 'Active',
      ...(form.password ? credentials : { passwordHash: editing?.passwordHash, passwordSalt: editing?.passwordSalt }),
    }
    setStaff((current) => editing ? current.map((item) => item.id === editing.id ? account : item) : [account, ...current])
    setModal(false)
    onToast(editing ? 'Staff account updated' : 'Staff account created')
  }
  return <>
    <div className="page-intro"><p>Control who can access BOOKHUB and what they can manage.</p><button className="button button-primary" onClick={() => open()}><Plus size={16} />Add staff member</button></div>
    <section className="staff-intro"><div className="staff-shield"><ShieldCheck size={23} /></div><div><strong>Access is role-based</strong><span>Administrators can manage users and system settings. Librarians can manage the catalog and circulation.</span></div><span className="staff-roles">2 roles</span></section>
    <section className="panel table-panel"><div className="panel-heading staff-heading"><div><span className="eyebrow">TEAM ACCESS</span><h2>Library staff</h2></div><span className="table-count">{staff.length} accounts</span></div><div className="table-scroll"><table><thead><tr><th>Staff member</th><th>Role</th><th>Status</th><th>Account ID</th><th /></tr></thead><tbody>{staff.map((member) => <tr key={member.id}><td><div className="person-cell"><Avatar name={member.name} /><div><strong>{member.name}</strong><span>{member.email}</span></div></div></td><td><span className="role-label"><ShieldCheck size={14} />{member.role}</span></td><td><StatusPill status={member.status} /></td><td>{member.id}</td><td><div className="row-actions"><button className="icon-button small" aria-label={`Edit ${member.name}`} onClick={() => open(member)}><Settings size={15} /></button><button className="icon-button small danger-icon" aria-label={`Delete ${member.name}`} onClick={() => setDeleting(member)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div></section>
    {modal && <Modal title={`${editing ? 'Edit' : 'Add'} staff account`} subtitle="Set login credentials and assign a role." onClose={() => setModal(false)}><form className="form-grid" onSubmit={save}>
      <label className="field-span">Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Staff member name" /></label>
      <label className="field-span">Email address<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@nu.edu.ph" /></label>
      <label className="field-span">Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option>Librarian</option><option>Administrator</option></select></label>
      <label className="field-span">{editing ? 'New password (optional)' : 'Password'}<input type="password" autoComplete="new-password" minLength="8" required={!editing} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder={editing ? 'Leave blank to keep current password' : 'At least 8 characters'} /></label>
      {formError && <p className="auth-error field-span" role="alert"><AlertCircle size={15} />{formError}</p>}
      <div className="form-actions field-span"><button type="button" className="button button-quiet" onClick={() => setModal(false)}>Cancel</button><button className="button button-primary"><Check size={15} />Save account</button></div>
    </form></Modal>}
    {deleting && <ConfirmDialog title="Delete staff account?" message={`Remove ${deleting.name}'s access to BOOKHUB?`} onClose={() => setDeleting(null)} onConfirm={() => { setStaff((current) => current.filter((member) => member.id !== deleting.id)); setDeleting(null); onToast('Staff account removed') }} />}
  </>
}

function SettingsPage({ settings, setSettings, onToast }) {
  const [draft, setDraft] = useState(settings)
  useEffect(() => setDraft(settings), [settings])
  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }))
  const save = (event) => { event.preventDefault(); setSettings(draft); onToast('Library settings saved') }
  return <form onSubmit={save}><div className="page-intro"><p>Set your library profile, lending rules, and account protections.</p><button className="button button-primary"><Check size={15} />Save changes</button></div><div className="settings-grid"><section className="panel settings-panel"><div className="settings-section-heading"><span className="settings-icon"><LibraryBig size={18} /></span><div><h2>Library profile</h2><p>How your library appears to its members.</p></div></div><label className="settings-field">Library name<input value={draft.libraryName} onChange={(event) => update('libraryName', event.target.value)} /></label><label className="settings-field">Contact email<input type="email" value={draft.email} onChange={(event) => update('email', event.target.value)} /></label></section><section className="panel settings-panel"><div className="settings-section-heading"><span className="settings-icon gold-icon"><Bookmark size={18} /></span><div><h2>Lending policy</h2><p>Default limits applied to new loans.</p></div></div><div className="settings-numeric-grid"><label className="settings-field">Loan period <span className="input-suffix"><input type="number" min="1" value={draft.loanDays} onChange={(event) => update('loanDays', event.target.value)} /><i>days</i></span></label><label className="settings-field">Maximum books <span className="input-suffix"><input type="number" min="1" value={draft.maxBooks} onChange={(event) => update('maxBooks', event.target.value)} /><i>books</i></span></label><label className="settings-field">Late fine <span className="input-suffix"><input type="number" min="0" value={draft.fineRate} onChange={(event) => update('fineRate', event.target.value)} /><i>PHP / day</i></span></label><label className="settings-field">Renewals allowed <span className="input-suffix"><input type="number" min="0" value={draft.renewals} onChange={(event) => update('renewals', event.target.value)} /><i>times</i></span></label></div></section><section className="panel settings-panel"><div className="settings-section-heading"><span className="settings-icon coral-icon"><Bell size={18} /></span><div><h2>Notifications</h2><p>Choose which reminders the library sends.</p></div></div><ToggleRow title="Due date reminders" description="Notify borrowers before a book is due." checked={draft.dueReminders} onChange={(value) => update('dueReminders', value)} /><ToggleRow title="Overdue alerts" description="Alert staff when a loan passes its due date." checked={draft.overdueAlerts} onChange={(value) => update('overdueAlerts', value)} /><ToggleRow title="New arrival digest" description="Send members a digest of new titles." checked={draft.newArrivals} onChange={(value) => update('newArrivals', value)} /></section><section className="panel settings-panel"><div className="settings-section-heading"><span className="settings-icon"><ShieldCheck size={18} /></span><div><h2>Security</h2><p>Protect staff accounts and library records.</p></div></div><ToggleRow title="Two-factor authentication" description="Require an additional verification step for staff." checked={draft.twoFactor} onChange={(value) => update('twoFactor', value)} /><label className="settings-field timeout-field">Automatic session timeout<select value={draft.sessionTimeout} onChange={(event) => update('sessionTimeout', event.target.value)}><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">1 hour</option><option value="120">2 hours</option></select></label><div className="security-footnote"><ShieldCheck size={15} />Passwords are protected and access is role-based.</div></section></div></form>
}

function ToggleRow({ title, description, checked, onChange }) {
  return <div className="toggle-row"><div><strong>{title}</strong><span>{description}</span></div><button className={`switch ${checked ? 'switch-on' : ''}`} type="button" role="switch" aria-checked={checked} aria-label={title} onClick={() => onChange(!checked)}><i /></button></div>
}

function MemberAccountPage({ session, borrowers, transactions }) {
  const borrower = borrowers.find((item) => item.email.toLowerCase() === session.email.toLowerCase())
  if (!borrower) return <section className="panel account-unlinked"><span className="settings-icon"><UserRound size={18} /></span><h2>Library account not linked</h2><p>We couldn't find a borrower profile for {session.email}. Ask library staff to connect your account so your loans appear here.</p></section>
  const mine = transactions.filter((item) => item.borrowerId === borrower.id).sort((a, b) => b.issued.localeCompare(a.issued))
  const active = mine.filter((item) => item.status !== 'Returned')
  const late = active.filter((item) => item.status === 'Overdue' || daysLate(item.due) > 0)
  return <>
    <div className="page-intro"><p>Your library profile and current borrowing activity.</p></div>
    <section className="panel member-profile"><Avatar name={borrower.name} /><div className="member-profile-copy"><span className="eyebrow">NU LIBRARY MEMBER</span><h2>{borrower.name}</h2><p>{borrower.id} · {borrower.course}</p><span>{borrower.email}</span></div><StatusPill status={borrower.status} /></section>
    <section className="circulation-summary"><div className="mini-summary"><span className="stat-icon blue"><BookCopy size={18} /></span><div><span>Books out</span><strong>{active.length}</strong></div></div><div className="mini-summary"><span className="stat-icon coral"><Clock3 size={18} /></span><div><span>Overdue</span><strong>{late.length}</strong></div></div><div className="mini-summary"><span className="stat-icon green"><CheckCircle2 size={18} /></span><div><span>Returned</span><strong>{mine.filter((item) => item.status === 'Returned').length}</strong></div></div></section>
    <section className="panel history-panel member-loans"><div className="panel-heading"><div><span className="eyebrow">YOUR ACTIVITY</span><h2>Loan history</h2></div><span className="table-count">{mine.length} records</span></div><TransactionTable transactions={mine} /></section>
  </>
}

export default function App() {
  const [books, setBooks] = useStoredState('bookhub.books', initialBooks)
  const [borrowers, setBorrowers] = useStoredState('bookhub.borrowers', initialBorrowers)
  const [transactions, setTransactions] = useStoredState('bookhub.transactions', initialTransactions)
  const [staff, setStaff] = useStoredState('bookhub.staff', initialStaff)
  const [settings, setSettings] = useStoredState('bookhub.settings', initialSettings)
  useEffect(() => {
    setStaff((current) => current.map((member) => member.id === 'ST-001' && member.email === 'leona.dechavez@nu.edu.ph' ? { ...member, email: 'admin@lrc.ph' } : member))
  }, [setStaff])
  const [session, setSession] = useStoredState('bookhub.session', null)
  const isMember = session?.role === 'student' || session?.role === 'employee'
  const visibleNavItems = isMember ? memberItems : navItems
  const visibleAdminItems = session?.role === 'admin' ? adminItems : []
  const allowedSections = isMember ? ['books', 'my-account'] : session?.role === 'admin' ? [...navItems, ...adminItems].map((item) => item.section) : navItems.map((item) => item.section)
  const [section, setSection] = useState(() => session && isMember ? 'books' : 'dashboard')
  const [selectedBook, setSelectedBook] = useState(null)
  const [toast, setToast] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [globalSearch, setGlobalSearch] = useState('')
  const navigate = (target, book = null) => {
    if (!allowedSections.includes(target)) return
    setSection(target)
    setSelectedBook(book)
    setSidebarOpen(false)
  }
  const notify = (message) => { setToast(message); window.clearTimeout(window.__bookhubToast); window.__bookhubToast = window.setTimeout(() => setToast(''), 2800) }
  const openBook = (book) => navigate('books', book)
  const logout = () => { setSession(null); setSection('dashboard'); setSelectedBook(null); setGlobalSearch(''); setSidebarOpen(false) }
  const headerTitle = selectedBook && section === 'books' ? 'Book details' : section === 'dashboard' && session ? `Good morning, ${session.name.split(' ')[0]}` : titles[section]
  const activeLoans = transactions.filter((item) => item.status !== 'Returned')
  const memberRecord = isMember ? borrowers.find((item) => item.email.toLowerCase() === session.email.toLowerCase()) : null
  const visibleLoans = isMember ? activeLoans.filter((item) => item.borrowerId === memberRecord?.id) : activeLoans
  const overdueCount = visibleLoans.filter((item) => item.status === 'Overdue' || daysLate(item.due) > 0).length
  const content = selectedBook && section === 'books'
    ? <BookDetail book={books.find((item) => item.id === selectedBook.id) || selectedBook} onBack={() => setSelectedBook(null)} onSaveBook={(updated) => { setBooks((current) => current.map((item) => item.id === updated.id ? updated : item)); notify('Book details updated') }} transactions={isMember ? transactions.filter((item) => item.borrowerId === memberRecord?.id) : transactions} canEdit={!isMember} />
    : section === 'dashboard' ? <Dashboard books={books} borrowers={borrowers} transactions={transactions} onNavigate={navigate} />
      : section === 'books' ? <BooksPage key={globalSearch} books={books} setBooks={setBooks} onToast={notify} onOpenBook={openBook} initialQuery={globalSearch} readOnly={isMember} />
        : section === 'my-account' ? <MemberAccountPage session={session} borrowers={borrowers} transactions={transactions} />
          : section === 'borrowers' ? <BorrowersPage borrowers={borrowers} setBorrowers={setBorrowers} transactions={transactions} onToast={notify} />
            : section === 'circulation' ? <CirculationPage books={books} setBooks={setBooks} borrowers={borrowers} transactions={transactions} setTransactions={setTransactions} settings={settings} onToast={notify} />
              : section === 'reports' ? <ReportsPage books={books} transactions={transactions} />
                : section === 'staff' ? <StaffPage staff={staff} setStaff={setStaff} onToast={notify} />
                  : <SettingsPage settings={settings} setSettings={setSettings} onToast={notify} />
  const searchSubmit = (event) => { event.preventDefault(); navigate('books') }
    const signIn = async (role, email, password) => {
      const normalized = normalizeEmail(email)
      let account = null
      let valid = false
      if (role === 'admin' && normalized === 'admin@lrc.ph' && password === 'admin123') {
        account = { name: 'Admin' }
        valid = true
      } else if (role === 'admin') {
        account = staff.find((item) => normalizeEmail(item.email) === normalized && item.role === 'Administrator' && item.status === 'Active')
        valid = await verifyPassword(password, account)
      } else if (role === 'librarian') {
        account = staff.find((item) => normalizeEmail(item.email) === normalized && item.role === 'Librarian' && item.status === 'Active')
        valid = await verifyPassword(password, account)
      } else if (role === 'student' || role === 'employee') {
        account = borrowers.find((item) => normalizeEmail(item.email) === normalized && item.accountType === role && item.status === 'Active')
        valid = await verifyPassword(password, account)
      }
      if (!account || !valid) throw new Error('Email or password is incorrect for the selected account type.')
      setSession({ authenticated: true, role, email: normalized, name: account.name || 'Library User' })
      setSection(role === 'student' || role === 'employee' ? 'books' : 'dashboard')
      setSelectedBook(null)
    }
    const createMemberAccount = async ({ role, email, password, name, course }) => {
      if (role !== 'student' && role !== 'employee') throw new Error('Only students and employees can create an account.')
      const normalized = normalizeEmail(email)
      if (staff.some((item) => normalizeEmail(item.email) === normalized)) throw new Error('This email belongs to a staff account. Choose another email.')
      const existing = borrowers.find((item) => normalizeEmail(item.email) === normalized)
      if (existing?.passwordHash) throw new Error('An account already exists for this email. Please sign in.')
      if (existing?.accountType && existing.accountType !== role) throw new Error('This borrower profile is registered under a different account type.')
      const credentials = await hashPassword(password)
      const account = existing
        ? { ...existing, ...credentials, accountType: role }
        : { id: `NU-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`, name: name.trim(), email: normalized, course: course.trim(), joined: today(), status: 'Active', borrowed: 0, accountType: role, ...credentials }
      setBorrowers((current) => existing ? current.map((item) => item.id === existing.id ? account : item) : [account, ...current])
      setSession({ authenticated: true, role, email: normalized, name: account.name })
      setSection('books')
      setSelectedBook(null)
    }
    if (!session?.authenticated) return <LoginScreen onLogin={signIn} onCreateAccount={createMemberAccount} />
  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <button className="brand" onClick={() => navigate(isMember ? 'books' : 'dashboard')}><span className="brand-mark"><BookOpen size={21} /></span><span className="brand-name">BOOK<span>HUB</span><small>NU LIBRARY SYSTEM</small></span></button>
        <nav className="main-nav" aria-label="Main navigation"><span className="nav-caption">{isMember ? 'YOUR LIBRARY' : 'WORKSPACE'}</span>{visibleNavItems.map(({ label, icon: Icon, section: target }) => <button key={target} className={`nav-item ${section === target ? 'nav-active' : ''}`} onClick={() => navigate(target)}><Icon size={18} /><span>{label}</span>{target === 'circulation' && overdueCount > 0 && <b className="nav-badge">{overdueCount}</b>}</button>)}{visibleAdminItems.length > 0 && <><span className="nav-caption nav-caption-admin">ADMINISTRATION</span>{visibleAdminItems.map(({ label, icon: Icon, section: target }) => <button key={target} className={`nav-item ${section === target ? 'nav-active' : ''}`} onClick={() => navigate(target)}><Icon size={18} /><span>{label}</span></button>)}</>}</nav>
        <div className="sidebar-bottom"><div className="help-block"><span className="help-icon"><CircleHelp size={17} /></span><strong>Need a hand?</strong><span>Visit the staff help desk.</span><button onClick={() => notify('Please contact the NU library administrator.')}>Get support <ArrowRight size={13} /></button></div><button className="profile-menu" onClick={logout} title="Sign out"><Avatar name={session.name} /><span><strong>{session.name}</strong><small>{roleOptions.find((item) => item.value === session.role)?.label}</small></span><LogOut size={16} /></button></div>
      </aside>
      {sidebarOpen && <button className="mobile-scrim" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
      <main className="main-area">
        <header className="topbar"><div className="topbar-left"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={19} /></button><div className="breadcrumb"><span>BOOKHUB</span><ChevronRight size={13} /><strong>{headerTitle}</strong></div></div><div className="topbar-actions"><form className="global-search" onSubmit={searchSubmit}><Search size={16} /><input aria-label="Search books" placeholder="Search anything…" value={globalSearch} onChange={(event) => setGlobalSearch(event.target.value)} /><kbd>⌘ K</kbd></form><button className="icon-button notification-button" aria-label="Notifications" onClick={() => notify(overdueCount ? `You have ${overdueCount} overdue item${overdueCount === 1 ? '' : 's'} to review.` : 'You are all caught up.')}><Bell size={18} />{overdueCount > 0 && <i />}</button><span className="topbar-divider" /><button className="top-avatar" aria-label="Sign out" title="Sign out" onClick={logout}><Avatar name={session.name} /></button></div></header>
        <div className="page-content"><div className="content-title-row"><div><h1>{headerTitle}</h1>{section === 'dashboard' && <span className="title-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>}</div>{section !== 'dashboard' && section !== 'settings' && <span className="title-context"><Activity size={14} />Library operations</span>}</div>{content}<footer className="page-footer"><span>© 2026 National University · BOOKHUB</span><span><span className="footer-live" />All systems operational</span></footer></div>
      </main>
      {toast && <div className="toast" role="status"><CheckCircle2 size={17} />{toast}<button onClick={() => setToast('')} aria-label="Dismiss notification"><X size={15} /></button></div>}
    </div>
  )
}