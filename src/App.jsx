import { useEffect, useMemo, useState } from 'react'
import {
  Activity, Bell, CheckCircle2, ChevronRight, Menu, Search, X,
} from 'lucide-react'
import {
  initialBooks, initialBorrowers, initialSettings, initialStaff, initialTransactions,
} from './data.js'
import LibrarianDashboard from '../Librarian/pages/LibrarianDesk.jsx'
import { CoverArt, StatusPill, Avatar, Modal, RecordForm, IssueForm, ConfirmDialog, TransactionTable, ActivityChart, DonutChart } from '../Librarian/components/LibraryShared.jsx'
import { daysLate, formatDate, hashPassword, money, normalizeEmail, today, verifyPassword } from '../Librarian/lib/helpers.js'
import { Dashboard as AdminDashboard } from './pages/AdminDashboard.jsx'
import { BooksPage } from '../Librarian/pages/Books.jsx'
import { BookDetail } from '../Librarian/pages/BookDetail.jsx'
import { BorrowersPage } from '../Librarian/pages/Borrowers.jsx'
import { CirculationPage } from '../Librarian/pages/Borrowing.jsx'
import { ReportsPage } from '../Librarian/pages/Reports.jsx'
import { StaffPage } from '../Librarian/pages/UsersStaff.jsx'
import { SettingsPage } from '../Librarian/pages/Settings.jsx'
import { MemberAccountPage } from './pages/MemberAccountPage.jsx'
import { AdminSidebar } from './components/AdminSidebar.jsx'
import { LibrarianSidebar } from './components/LibrarianSidebar.jsx'
import { MemberSidebar } from './components/MemberSidebar.jsx'
import LoginScreen from './components/LoginScreen.jsx'

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
  const allowedSections = isMember ? ['books', 'my-account'] : ['dashboard', 'books', 'borrowers', 'circulation', 'reports', 'staff', 'settings']
  const [section, setSection] = useState(() => session && isMember ? 'books' : 'dashboard')
  const [activeNavItem, setActiveNavItem] = useState(() => session && isMember ? 'books' : 'dashboard')
  const [selectedBook, setSelectedBook] = useState(null)
  const [toast, setToast] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [globalSearch, setGlobalSearch] = useState('')
  const navigate = (target, book = null, navItem = target) => {
    if (!allowedSections.includes(target)) return
    setSection(target)
    setActiveNavItem(navItem)
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
            : section === 'circulation' ? <CirculationPage books={books} setBooks={setBooks} borrowers={borrowers} transactions={transactions} setTransactions={setTransactions} settings={settings} onToast={notify} initialTab={activeNavItem === 'returns' ? 'Returns' : activeNavItem === 'overdue-books' ? 'Overdue' : 'All transactions'} />
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
    <div className="min-h-screen bg-[#f4f5f2]">
      {session.role === 'admin'
        ? <AdminSidebar session={session} activeNavItem={activeNavItem} onNavigate={navigate} onLogout={logout} sidebarOpen={sidebarOpen} />
        : session.role === 'librarian'
          ? <LibrarianSidebar session={session} activeNavItem={activeNavItem} overdueCount={overdueCount} onNavigate={navigate} onLogout={logout} sidebarOpen={sidebarOpen} />
          : <MemberSidebar session={session} activeNavItem={activeNavItem} onNavigate={navigate} onLogout={logout} sidebarOpen={sidebarOpen} />}
      {sidebarOpen && <button className="fixed inset-0 z-20 bg-[#173b63]/40 md:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
      <main className="min-h-screen md:ml-[246px]">
        <header className="flex h-[67px] items-center justify-between border-b border-[#e2e8f0] bg-[#f8fafc]/85 px-6 backdrop-blur-sm md:px-9">
          <div className="flex items-center gap-3">
            <button className="inline-grid h-[34px] w-[34px] place-items-center rounded-md border border-transparent text-[#173b63] transition hover:bg-[#e2e8f0] hover:text-[#173b63] md:hidden" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}>
              <Menu size={19} />
            </button>
            <div className="flex items-center gap-2 text-[10px] text-[#64748b]">
              <span className="font-semibold tracking-[0.45px] text-[#64748b]">BOOKHUB</span>
              <ChevronRight size={13} className="text-[#64748b]" />
              <strong className="font-semibold text-[#173b63]">{headerTitle}</strong>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <form className="hidden items-center gap-2 rounded-md border border-[#e2e8f0] bg-[#fbfbfa] px-2.5 py-1.5 text-[#64748b] md:flex md:w-[230px]" onSubmit={searchSubmit}>
              <Search size={16} />
              <input aria-label="Search books" placeholder="Search anything…" value={globalSearch} onChange={(event) => setGlobalSearch(event.target.value)} className="min-w-0 flex-1 border-0 bg-transparent text-[11px] text-[#173b63] placeholder:text-[#64748b] focus:outline-none" />
              <kbd className="rounded border border-[#e2e8f0] bg-[#f8fafc] px-1.5 py-0.5 text-[8px] text-[#64748b]">⌘ K</kbd>
            </form>
            <button className="relative inline-grid h-[34px] w-[34px] place-items-center rounded-md border border-transparent text-[#64748b] transition hover:bg-[#e2e8f0] hover:text-[#173b63]" aria-label="Notifications" onClick={() => notify(overdueCount ? `You have ${overdueCount} overdue item${overdueCount === 1 ? '' : 's'} to review.` : 'You are all caught up.') }>
              <Bell size={18} />
              {overdueCount > 0 && <i className="absolute right-[7px] top-[7px] h-1.5 w-1.5 rounded-full border border-white bg-[#c86e5f]" />}
            </button>
            <span className="h-[26px] w-px bg-[#e2e8f0]" />
            <button className="grid rounded-full bg-transparent p-0" aria-label="Sign out" title="Sign out" onClick={logout}>
              <Avatar name={session.name} />
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-6 pb-0 pt-6 md:px-9">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h1 className="m-0 text-[21px] font-bold leading-[1.35] text-[#173b63]">{headerTitle}</h1>
              {section === 'dashboard' && <span className="mt-1 block text-[10px] text-[#64748b]">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>}
            </div>
            {section !== 'dashboard' && section !== 'settings' && (
              <span className="inline-flex items-center gap-1.5 text-[10px] text-[#64748b]">
                <Activity size={14} />
                Library operations
              </span>
            )}
          </div>

          {content}

          <footer className="mt-6 flex items-center justify-between gap-3 border-t border-[#e2e8f0] py-4 text-[11px] text-[#64748b]">
            <span>© 2026 National University · BOOKHUB</span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#4d8a70]" />
              All systems operational
            </span>
          </footer>
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-[#d9ebdf] bg-[#f3faf5] px-3 py-2 text-sm font-medium text-[#2f5d4c] shadow-lg" role="status">
          <CheckCircle2 size={17} />
          {toast}
          <button onClick={() => setToast('')} aria-label="Dismiss notification" className="ml-1 text-[#64748b] transition hover:text-[#173b63]">
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  )
}