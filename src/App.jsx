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
import LibrarianDashboard from '../Librarian/Dashboard.jsx'
import { CoverArt, StatusPill, Avatar, Modal, RecordForm, IssueForm, ConfirmDialog, TransactionTable, ActivityChart, DonutChart } from '../Librarian/components/LibraryShared.jsx'
import { daysLate, formatDate, hashPassword, money, normalizeEmail, today, verifyPassword } from '../Librarian/lib/helpers.js'
import { Dashboard as AdminDashboard } from './pages/AdminDashboard.jsx'
import { BooksPage } from '../Librarian/pages/BooksPage.jsx'
import { BookDetail } from '../Librarian/pages/BookDetail.jsx'
import { BorrowersPage } from '../Librarian/pages/BorrowersPage.jsx'
import { CirculationPage } from '../Librarian/pages/CirculationPage.jsx'
import { ReportsPage } from '../Librarian/pages/ReportsPage.jsx'
import { StaffPage } from './pages/StaffPage.jsx'
import { SettingsPage } from './pages/SettingsPage.jsx'
import { MemberAccountPage } from './pages/MemberAccountPage.jsx'

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






















export default function App() {
  const [books, setBooks] = useStoredState('bookhub.books', initialBooks)
  const [borrowers, setBorrowers] = useStoredState('bookhub.borrowers', initialBorrowers)
  const [transactions, setTransactions] = useStoredState('bookhub.transactions', initialTransactions)
  const [staff, setStaff] = useStoredState('bookhub.staff', initialStaff)
  const [settings, setSettings] = useStoredState('bookhub.settings', initialSettings)
  useEffect(() => {
    setStaff((current) => current.map((member) => {
      if (member.id === 'ST-001' && member.email === 'leona.dechavez@nu.edu.ph') {
        return { ...member, email: 'admin@lrc.ph' }
      }
      if (member.id === 'ST-002' && member.email === 'carlo.bautista@nu.edu.ph') {
        return { ...member, name: 'Bench' }
      }
      return member
    }))
  }, [setStaff])
  const [session, setSession] = useStoredState('bookhub.session', null)
  useEffect(() => {
    if (!session?.authenticated || session.role !== 'librarian') return
    const account = staff.find((member) => normalizeEmail(member.email) === normalizeEmail(session.email) && member.role === 'Librarian')
    if (account && account.name !== session.name) {
      setSession((current) => ({ ...current, name: account.name }))
    }
  }, [session, staff, setSession])
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
    : section === 'dashboard' ? session?.role === 'librarian'
      ? <LibrarianDashboard
        userName={session.name || 'Bench'}
        books={books}
        borrowers={borrowers}
        transactions={transactions}
        onNavigate={navigate}
        onIssueBook={() => navigate('circulation')}
        onRecordReturn={() => navigate('circulation')}
      />
      : <AdminDashboard books={books} borrowers={borrowers} transactions={transactions} onNavigate={navigate} />
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