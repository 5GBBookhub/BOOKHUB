import { useEffect, useMemo, useState } from 'react'
import {
  Activity, Bell, CheckCircle2, ChevronRight, Menu, Search, X,
} from 'lucide-react'
import {
  initialBooks, initialBorrowers, initialSettings, initialStaff, initialTransactions,
} from './data.js'
import LibrarianDashboard from '../Librarian/pages/Dashboard.jsx'
import LibrarianDesk from '../Librarian/pages/LibrarianDesk.jsx'
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
import { MemberAccountPage } from './pages/MemberDashboard.jsx'
import { AdminSidebar } from './components/AdminSidebar.jsx'
import { LibrarianSidebar } from './components/LibrarianSidebar.jsx'
import { MemberSidebar } from './components/MemberSidebar.jsx'
import LoginScreen from './components/LoginScreen.jsx'

const titles = {
  dashboard: 'Good morning, Leona', 'librarian-desk': 'Librarian Desk', books: 'Book catalog', borrowers: 'Borrowers',
  circulation: 'Circulation desk', reports: 'Library reports', staff: 'Users & staff',
  settings: 'Settings', 'my-account': 'My account', history: 'Borrowing history',
}
function useStoredState(key, fallback, sessionOnly = false) {
  const storage = sessionOnly ? window.sessionStorage : window.localStorage
  const [value, setValue] = useState(() => {
    try {
      const stored = storage.getItem(key)
      return stored ? JSON.parse(stored) : fallback
    } catch {
      return fallback
    }
  })
  useEffect(() => {
    storage.setItem(key, JSON.stringify(value))
  }, [key, storage, value])
  useEffect(() => {
    if (sessionOnly) return undefined
    const syncFromOtherTab = (event) => {
      if (event.key !== key) return
      try {
        setValue(event.newValue ? JSON.parse(event.newValue) : fallback)
      } catch {
        setValue(fallback)
      }
    }
    window.addEventListener('storage', syncFromOtherTab)
    return () => window.removeEventListener('storage', syncFromOtherTab)
  }, [fallback, key, sessionOnly])
  return [value, setValue]
}

export default function App() {
  const [books, setBooks] = useStoredState('bookhub.books', initialBooks)
  const [borrowers, setBorrowers] = useStoredState('bookhub.borrowers', initialBorrowers)
  const [transactions, setTransactions] = useStoredState('bookhub.transactions', initialTransactions)
  const [activityNotifications, setActivityNotifications] = useStoredState('bookhub.activityNotifications', [])
  const [staff, setStaff] = useStoredState('bookhub.staff', initialStaff)
  const [settings, setSettings] = useStoredState('bookhub.settings', initialSettings)
  useEffect(() => {
    setStaff((current) => current.map((member) => {
      if (member.id === 'ST-001' && member.email === 'leona.dechavez@lib.ph') {
        return { ...member, email: 'admin@lrc.ph' }
      }
      if (member.id === 'ST-002' && member.email === 'carlo.bautista@lib.ph') {
        return { ...member, name: 'Bench' }
      }
      return member
    }))
  }, [setStaff])
  const [session, setSession] = useStoredState('bookhub.session', null, true)
  useEffect(() => {
    const expirePendingRequests = () => {
      const now = Date.now()
      setTransactions((current) => {
        const expired = current.filter((item) => item.status === 'Pending' && item.claimExpiresAt <= now)
        if (!expired.length) return current
        setBooks((currentBooks) => currentBooks.map((book) => {
          const released = expired.filter((item) => item.bookId === book.id).length
          return released ? { ...book, available: Math.min(book.copies, book.available + released) } : book
        }))
        return current.map((item) => expired.some((expiredItem) => expiredItem.id === item.id)
          ? { ...item, status: 'Cancelled', cancelledAt: new Date(now).toISOString(), cancellationReason: 'Claim grace period expired' }
          : item)
      })
    }
    expirePendingRequests()
    const interval = window.setInterval(expirePendingRequests, 30_000)
    return () => window.clearInterval(interval)
  }, [setBooks, setTransactions])
  useEffect(() => {
    if (!session?.authenticated || session.role !== 'librarian') return
    const account = staff.find((member) => normalizeEmail(member.email) === normalizeEmail(session.email) && member.role === 'Librarian')
    if (account && account.name !== session.name) {
      setSession((current) => ({ ...current, name: account.name }))
    }
  }, [session, staff, setSession])
  const isMember = session?.role === 'student' || session?.role === 'employee'
  const allowedSections = isMember ? ['dashboard', 'books', 'history'] : ['dashboard', 'librarian-desk', 'books', 'borrowers', 'circulation', 'reports', 'staff', 'settings']
  const [section, setSection] = useState(() => session && isMember ? 'dashboard' : 'dashboard')
  const [activeNavItem, setActiveNavItem] = useState(() => session && isMember ? 'dashboard' : 'dashboard')
  const [selectedBook, setSelectedBook] = useState(null)
  const [toast, setToast] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [globalSearch, setGlobalSearch] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const navigate = (target, book = null, navItem = target) => {
    if (!allowedSections.includes(target)) return
    setSection(target)
    setActiveNavItem(navItem)
    setSelectedBook(book)
    setSidebarOpen(false)
  }
  const notify = (message) => { setToast(message); window.clearTimeout(window.__bookhubToast); window.__bookhubToast = window.setTimeout(() => setToast(''), 2800) }
  const notifyStaffActivity = (action, transaction) => {
    const verb = action === 'returned' ? 'returned' : 'borrowed'
    const notification = {
      id: `${transaction.id}-${action}-${Date.now()}`,
      message: `${transaction.borrower} ${verb} “${transaction.title}”.`,
      audience: 'staff',
      createdAt: new Date().toISOString(),
      readBy: [],
    }
    setActivityNotifications((current) => [notification, ...current].slice(0, 100))
  }
  const notifyMembersBookAvailable = (book) => {
    const notification = {
      id: `${book.id}-available-${Date.now()}`,
      message: `“${book.title}” is available to borrow again.`,
      audience: 'members',
      createdAt: new Date().toISOString(),
      readBy: [],
    }
    setActivityNotifications((current) => [notification, ...current].slice(0, 100))
  }
  const isStaff = session?.role === 'admin' || session?.role === 'librarian'
  const currentStaffEmail = normalizeEmail(session?.email || '')
  const notificationAudience = isStaff ? 'staff' : 'members'
  const visibleNotifications = activityNotifications.filter((item) => item.audience === notificationAudience)
  const unreadNotifications = visibleNotifications.filter((item) => !item.readBy?.includes(currentStaffEmail)).length
  const markNotificationsRead = () => {
    setActivityNotifications((current) => current.map((item) => (
      item.readBy?.includes(currentStaffEmail)
        ? item
        : { ...item, readBy: [...(item.readBy || []), currentStaffEmail] }
    )))
  }
  const openBook = (book) => navigate('books', book)
  const logout = () => { setSession(null); setSection('dashboard'); setSelectedBook(null); setGlobalSearch(''); setSidebarOpen(false) }
  const headerTitle = selectedBook && section === 'books' ? 'Book details' : section === 'dashboard' ? 'Dashboard' : titles[section]
  const activeLoans = transactions.filter((item) => ['Pending', 'Borrowed', 'Overdue'].includes(item.status))
  const memberRecord = isMember ? borrowers.find((item) => item.email.toLowerCase() === session.email.toLowerCase()) : null
  const visibleLoans = isMember ? activeLoans.filter((item) => item.borrowerId === memberRecord?.id) : activeLoans
  const overdueCount = visibleLoans.filter((item) => item.status === 'Overdue' || daysLate(item.due) > 0).length
  const content = selectedBook && section === 'books'
    ? <BookDetail book={books.find((item) => item.id === selectedBook.id) || selectedBook} onBack={() => setSelectedBook(null)} onSaveBook={(updated) => { setBooks((current) => current.map((item) => item.id === updated.id ? updated : item)); notify('Book details updated') }} transactions={isMember ? transactions.filter((item) => item.borrowerId === memberRecord?.id) : transactions} canEdit={!isMember} />
    : section === 'dashboard'
      ? session?.role === 'librarian'
        ? <LibrarianDashboard
            userName={session.name || 'Bench'}
            books={books}
            borrowers={borrowers}
            transactions={transactions}
            onNavigate={navigate}
            onIssueBook={() => navigate('circulation')}
            onRecordReturn={() => navigate('circulation')}
          />
        : isMember
          ? <MemberAccountPage.MemberDashboard session={session} borrowers={borrowers} transactions={transactions} onNavigate={navigate} />
          : <AdminDashboard books={books} borrowers={borrowers} transactions={transactions} onNavigate={navigate} />
      : section === 'librarian-desk'
        ? <LibrarianDesk books={books} borrowers={borrowers} transactions={transactions} settings={settings} setBooks={setBooks} setTransactions={setTransactions} onToast={notify} onActivityNotification={notifyStaffActivity} onBookAvailable={notifyMembersBookAvailable} />
        : section === 'books'
          ? <BooksPage key={globalSearch} books={books} setBooks={setBooks} onToast={notify} onOpenBook={openBook} initialQuery={globalSearch} readOnly={isMember} memberBorrowedBookIds={memberRecord ? transactions.filter((item) => item.borrowerId === memberRecord.id && ['Pending', 'Borrowed', 'Overdue'].includes(item.status)).map((item) => item.bookId) : []} onBorrowBook={(book, borrowDate, returnDate) => {
              if (!session || !memberRecord) {
                notify('You need an active member profile to borrow a book.')
                return
              }
              const alreadyBorrowed = transactions.some((item) => item.borrowerId === memberRecord.id && item.bookId === book.id && ['Pending', 'Borrowed', 'Overdue'].includes(item.status))
              if (alreadyBorrowed) {
                notify('You already borrowed this book. You can only borrow each book once at a time.')
                return
              }
              const available = books.find((item) => item.id === book.id)?.available ?? 0
              if (available <= 0) {
                notify('This book is currently unavailable.')
                return
              }
              const nextId = `TRX-${String(Date.now()).slice(-4)}`
              const requestedAt = Date.now()
              const entry = {
                id: nextId,
                borrowerId: memberRecord.id,
                borrower: memberRecord.name,
                bookId: book.id,
                title: book.title,
                issued: borrowDate,
                due: returnDate,
                status: 'Pending',
                requestedAt: new Date(requestedAt).toISOString(),
                claimExpiresAt: requestedAt + 30 * 60 * 1000,
                fine: 0,
              }
              setTransactions((current) => [entry, ...current])
              setBooks((current) => current.map((item) => item.id === book.id ? { ...item, available: Math.max(0, item.available - 1), borrowed: item.borrowed + 1 } : item))
              notify(`Borrow request sent for “${book.title}”. Wait for librarian confirmation.`)
            }} />
          : section === 'history'
            ? <MemberAccountPage.MemberHistory session={session} borrowers={borrowers} transactions={transactions} />
            : section === 'my-account'
              ? <MemberAccountPage session={session} borrowers={borrowers} transactions={transactions} />
              : section === 'borrowers'
                ? <BorrowersPage borrowers={borrowers} setBorrowers={setBorrowers} transactions={transactions} onToast={notify} />
                : section === 'circulation'
                  ? <CirculationPage books={books} setBooks={setBooks} borrowers={borrowers} transactions={transactions} setTransactions={setTransactions} settings={settings} onToast={notify} onActivityNotification={notifyStaffActivity} onBookAvailable={notifyMembersBookAvailable} initialTab={activeNavItem === 'returns' ? 'Returns' : activeNavItem === 'overdue-books' ? 'Overdue' : 'All transactions'} />
                  : section === 'reports'
                    ? <ReportsPage books={books} transactions={transactions} />
                    : section === 'staff'
                      ? <StaffPage staff={staff} setStaff={setStaff} onToast={notify} />
                      : <SettingsPage settings={settings} setSettings={setSettings} onToast={notify} />
  const searchSubmit = (event) => { event.preventDefault(); navigate('books') }
    const signIn = async (_role, email, password) => {
      const normalized = normalizeEmail(email)
      const staffAccount = staff.find((item) => normalizeEmail(item.email) === normalized && item.status === 'Active')
      const memberAccount = borrowers.find((item) => normalizeEmail(item.email) === normalized && item.status === 'Active')
      let account = null
      let role = ''
      let valid = false
      if (normalized === 'admin@lrc.ph' && password === 'admin123') {
        account = staffAccount || { name: 'Admin' }
        role = 'admin'
        valid = true
      } else if (staffAccount) {
        account = staffAccount
        role = staffAccount.role === 'Administrator' ? 'admin' : 'librarian'
        valid = await verifyPassword(password, staffAccount)
      } else if (memberAccount) {
        account = memberAccount
        role = memberAccount.accountType || 'student'
        valid = await verifyPassword(password, memberAccount)
      }
      if (!account || !valid) throw new Error('Email or password is incorrect.')
      setSession({ authenticated: true, role, email: normalized, name: account.name || 'Library User' })
      setSection('dashboard')
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
      setSection('dashboard')
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
      {sidebarOpen && <button className="fixed inset-0 z-20 bg-[#684a37]/40 md:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
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
            {isStaff ? (
              <div className="relative">
                <button className="relative inline-grid h-[34px] w-[34px] place-items-center rounded-md border border-transparent text-[#64748b] transition hover:bg-[#e2e8dc] hover:text-[#173b63]" aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ''}`} aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)}>
                  <Bell size={18} />
                  {unreadNotifications > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#c86e5f] px-1 text-[9px] font-bold text-white">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>}
                </button>
                {notificationsOpen && (
                  <section className="absolute right-0 top-11 z-50 w-[min(350px,calc(100vw-2rem))] rounded-2xl border border-[#e5dbd1] bg-[#fbf8f4] p-3 shadow-[0_18px_45px_rgba(71,49,38,0.18)]" aria-label="Activity notifications">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h2 className="text-sm font-bold text-[#342a23]">Borrowing activity</h2>
                      {unreadNotifications > 0 && <button className="text-[11px] font-semibold text-[#684a37] hover:text-[#50392c]" onClick={markNotificationsRead}>Mark all read</button>}
                    </div>
                    <div className="max-h-[min(60vh,360px)] space-y-2 overflow-y-auto">
                      {visibleNotifications.length ? visibleNotifications.map((item) => {
                        const unread = !item.readBy?.includes(currentStaffEmail)
                        return (
                          <article key={item.id} className={`rounded-xl border px-3 py-2.5 ${unread ? 'border-[#d8c3b1] bg-[#f3e8dd]' : 'border-[#e5dbd1] bg-[#fffdfb]'}`}>
                            <p className="text-xs font-medium leading-5 text-[#342a23]">{item.message}</p>
                            <time className="mt-1 block text-[10px] text-[#806f61]" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time>
                          </article>
                        )
                      }) : <p className="py-6 text-center text-xs text-[#806f61]">No borrowing or return activity yet.</p>}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              <div className="relative">
                <button className="relative inline-grid h-[34px] w-[34px] place-items-center rounded-md border border-transparent text-[#64748b] transition hover:bg-[#e2e8dc] hover:text-[#173b63]" aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ''}`} aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)}>
                  <Bell size={18} />
                  {unreadNotifications > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#c86e5f] px-1 text-[9px] font-bold text-white">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>}
                </button>
                {notificationsOpen && (
                  <section className="absolute right-0 top-11 z-50 w-[min(350px,calc(100vw-2rem))] rounded-2xl border border-[#e5dbd1] bg-[#fbf8f4] p-3 shadow-[0_18px_45px_rgba(71,49,38,0.18)]" aria-label="Book availability notifications">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h2 className="text-sm font-bold text-[#342a23]">Book availability</h2>
                      {unreadNotifications > 0 && <button className="text-[11px] font-semibold text-[#684a37] hover:text-[#50392c]" onClick={markNotificationsRead}>Mark all read</button>}
                    </div>
                    <div className="max-h-[min(60vh,360px)] space-y-2 overflow-y-auto">
                      {visibleNotifications.length ? visibleNotifications.map((item) => {
                        const unread = !item.readBy?.includes(currentStaffEmail)
                        return (
                          <article key={item.id} className={`rounded-xl border px-3 py-2.5 ${unread ? 'border-[#d8c3b1] bg-[#f3e8dd]' : 'border-[#e5dbd1] bg-[#fffdfb]'}`}>
                            <p className="text-xs font-medium leading-5 text-[#342a23]">{item.message}</p>
                            <time className="mt-1 block text-[10px] text-[#806f61]" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time>
                          </article>
                        )
                      }) : <p className="py-6 text-center text-xs text-[#806f61]">No books have become available yet.</p>}
                    </div>
                  </section>
                )}
              </div>
            )}
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
            <span>© 2026 BOOKHUB</span>
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