import { useMemo } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Bell,
  BookCopy,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock3,
  LibraryBig,
  Plus,
  RotateCcw,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  initialBooks,
  initialBorrowers,
  initialTransactions,
} from '../../src/data.js'
import { CoverArt } from '../components/LibraryShared.jsx'

const today = () => new Date().toISOString().slice(0, 10)
const formatDate = (value) => value
  ? new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  : '—'
const daysLate = (due) => Math.max(0, Math.floor(
  (new Date(`${today()}T00:00:00`) - new Date(`${due}T00:00:00`)) / 86400000,
))

const statusStyles = {
  Borrowed: 'bg-[#e2e8f0] text-[#64748b]',
  Overdue: 'bg-[#f8eae6] text-[#b45e50]',
  Returned: 'bg-[#e8f2eb] text-[#4b8068]',
}

function Avatar({ name }) {
  const initials = name.split(' ').map((part) => part[0]).slice(0, 2).join('')
  return (
    <span className="inline-grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#94a3b8] text-[9px] font-bold text-[#173b63]">
      {initials}
    </span>
  )
}

function StatusPill({ status }) {
  return (
    <span className={`inline-flex min-h-[21px] items-center gap-1.5 rounded-xl px-2 text-[8px] font-semibold ${statusStyles[status] || 'bg-[#e2e8f0] text-[#173b63]'}`}>
      <i className="h-[5px] w-[5px] rounded-full bg-current" />
      {status}
    </span>
  )
}

function MetricCard({ label, value, detail, icon: Icon, tone, onClick }) {
  const tones = {
    blue: 'bg-[#e2e8f0] text-[#64748b]',
    gold: 'bg-[#e2e8f0] text-[#64748b]',
    green: 'bg-[#e6f0e9] text-[#4f816b]',
    coral: 'bg-[#f6e9e5] text-[#b96353]',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex min-h-[126px] flex-col items-start rounded-md border border-[#e2e8f0] bg-[#f8fafc] p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(28,50,67,.065)]"
    >
      <span className={`grid h-9 w-9 place-items-center rounded-lg ${tones[tone]}`}><Icon size={19} /></span>
      <span className="absolute left-[68px] top-5 text-[10px] text-[#64748b]">{label}</span>
      <strong className="mt-3 font-display text-[24px] leading-none text-[#173b63]">{value}</strong>
      <span className="mt-2 text-[9px] text-[#94a3b8]">{detail}</span>
      <ArrowRight className="absolute right-4 top-5 text-[#94a3b8] transition group-hover:translate-x-0.5" size={15} />
    </button>
  )
}

function DashboardMetric({ label, value, detail, icon: Icon, tone, change, onClick }) {
  const tones = {
    blue: 'bg-[#e8d8c8] text-[#684a37]',
    sky: 'bg-[#e8d8c8] text-[#684a37]',
    green: 'bg-[#dcf8e7] text-[#15945b]',
    coral: 'bg-[#ffe3df] text-[#ef4c4c]',
  }
  const isNegative = change.startsWith('↓')
  return (
    <button type="button" onClick={onClick} className="relative min-h-[184px] rounded-[18px] border border-[#e3e7ed] bg-white p-5 text-left shadow-[0_2px_5px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-md">
      <span className={`grid h-11 w-11 place-items-center rounded-[15px] ${tones[tone]}`}><Icon size={21} /></span>
      <span className={`absolute right-5 top-5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${isNegative ? 'bg-[#ffe3df] text-[#ef4c4c]' : 'bg-[#d9f8e6] text-[#15945b]'}`}>{change}</span>
      <strong className="mt-5 block text-[31px] font-bold leading-none tracking-tight text-[#111827]">{value}</strong>
      <span className="mt-2 block text-sm font-medium text-[#334155]">{label}</span>
      <span className="mt-2 block text-xs text-[#94a3b8]">{detail}</span>
    </button>
  )
}

function BorrowingActivityChart() {
  return (
    <div className="mt-5">
      <svg className="h-[220px] w-full" viewBox="0 0 700 220" preserveAspectRatio="none" role="img" aria-label="Borrowing activity over the last seven months">
        <defs>
          <linearGradient id="borrowedFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#684a37" stopOpacity=".28" /><stop offset="100%" stopColor="#684a37" stopOpacity=".04" /></linearGradient>
          <linearGradient id="returnedFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#19a765" stopOpacity=".2" /><stop offset="100%" stopColor="#19a765" stopOpacity=".03" /></linearGradient>
        </defs>
        {[24, 85, 146, 207].map((y) => <line key={y} x1="0" y1={y} x2="700" y2={y} stroke="#d9e1ea" strokeDasharray="3 3" />)}
        <path d="M0 144 C48 124 78 111 116 103 S185 87 232 83 S287 100 333 119 S389 145 430 151 S483 97 523 77 S582 61 620 54 S666 48 700 44 L700 207 L0 207Z" fill="url(#borrowedFill)" />
        <path d="M0 144 C48 124 78 111 116 103 S185 87 232 83 S287 100 333 119 S389 145 430 151 S483 97 523 77 S582 61 620 54 S666 48 700 44" fill="none" stroke="#684a37" strokeWidth="3" strokeLinecap="round" />
        <path d="M0 159 C47 143 82 130 119 119 S184 96 232 91 S290 101 333 113 S390 135 430 137 S478 98 523 86 S580 91 620 98 S670 111 700 115 L700 207 L0 207Z" fill="url(#returnedFill)" />
        <path d="M0 159 C47 143 82 130 119 119 S184 96 232 91 S290 101 333 113 S390 135 430 137 S478 98 523 86 S580 91 620 98 S670 111 700 115" fill="none" stroke="#19a765" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-[#64748b]"><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span></div>
    </div>
  )
}

function TransactionStatus({ transactions }) {
  const statuses = [
    ['Borrowed', transactions.filter((item) => item.status === 'Borrowed').length, '#684a37'],
    ['Returned', transactions.filter((item) => item.status === 'Returned').length, '#15945b'],
    ['Overdue', transactions.filter((item) => item.status === 'Overdue').length, '#ef3030'],
    ['Pending', transactions.filter((item) => item.status === 'Pending').length, '#ed9200'],
  ]
  const total = statuses.reduce((sum, [, count]) => sum + count, 0) || 1
  const radius = 57
  const circumference = 2 * Math.PI * radius
  let offset = 0
  return (
    <div className="mt-5 flex items-center justify-center gap-5">
      <div className="relative h-[178px] w-[178px] shrink-0">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 150 150" role="img" aria-label="Transaction status distribution">
          <circle cx="75" cy="75" r={radius} fill="none" stroke="#edf1f5" strokeWidth="25" />
          {statuses.map(([label, count, color]) => {
            const length = (count / total) * circumference
            const segment = <circle key={label} cx="75" cy="75" r={radius} fill="none" stroke={color} strokeWidth="25" strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-offset} />
            offset += length
            return segment
          })}
        </svg>
        <div className="absolute inset-[38px] grid place-items-center rounded-full bg-white text-center"><strong className="text-[24px] leading-none text-[#111827]">{transactions.length}</strong><span className="mt-1 text-[10px] text-[#64748b]">Active</span></div>
      </div>
      <div className="min-w-[130px] space-y-3">
        {statuses.map(([label, count, color]) => <div key={label} className="flex items-center justify-between gap-4 text-sm text-[#334155]"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />{label}</span><strong className="text-[#111827]">{count}</strong></div>)}
      </div>
    </div>
  )
}

export default function Dashboard({
  userName = 'Bench',
  books = initialBooks,
  borrowers = initialBorrowers,
  transactions = initialTransactions,
  onNavigate = () => {},
  onIssueBook = () => {},
  onRecordReturn = () => {},
}) {
  const overdue = useMemo(
    () => transactions.filter((item) => item.status === 'Overdue' || (item.status === 'Borrowed' && daysLate(item.due) > 0)),
    [transactions],
  )
  const activeLoans = transactions.filter((item) => item.status !== 'Returned')
  const availableCopies = books.reduce((sum, book) => sum + book.available, 0)
  const totalCopies = books.reduce((sum, book) => sum + book.copies, 0)
  const popularBooks = [...books].sort((a, b) => b.borrowed - a.borrowed).slice(0, 4)
  const dueSoon = activeLoans
    .filter((item) => item.status === 'Borrowed' && daysLate(item.due) === 0)
    .slice(0, 4)

  return (
    <main className="font-sans text-[#173b63]">
      <div className="mx-auto max-w-[1500px]">
        <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-[#111827]">Welcome back, {userName}</h1>
            <p className="mt-1 text-sm text-[#64748b]">Here's what's happening across your library today.</p>
          </div>
          <button type="button" onClick={onIssueBook} className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl bg-[#173b63] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#234f80] md:self-auto"><Plus size={16} /> New Borrowing</button>
        </section>

        <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardMetric label="Total Books" value={totalCopies} detail={`${books.length} unique titles`} icon={BookOpen} tone="blue" change="↗ 4.2%" onClick={() => onNavigate('books')} />
          <DashboardMetric label="Currently Borrowed" value={activeLoans.length} detail="Active loans" icon={BookCopy} tone="sky" change="↗ 2.1%" onClick={() => onNavigate('circulation')} />
          <DashboardMetric label="Active Borrowers" value={borrowers.filter((item) => item.status === 'Active').length} detail="Members in good standing" icon={Users} tone="green" change="↗ 0.8%" onClick={() => onNavigate('borrowers')} />
          <DashboardMetric label="Overdue Books" value={overdue.length} detail="Require follow-up" icon={Clock3} tone="coral" change="↘ 1.4%" onClick={() => onNavigate('circulation', 'Overdue')} />
        </section>

        <section className="mb-5 grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(330px,.8fr)]">
          <div className="rounded-[18px] border border-[#e3e7ed] bg-white p-5 shadow-[0_2px_5px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-bold text-[#111827]">Borrowing Activity</h2>
            <p className="mt-1 text-sm text-[#64748b]">Books borrowed vs returned over the last 7 months</p>
            <BorrowingActivityChart />
          </div>
          <div className="rounded-[18px] border border-[#e3e7ed] bg-white p-5 shadow-[0_2px_5px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-bold text-[#111827]">Transaction Status</h2>
            <p className="mt-1 text-sm text-[#64748b]">Current distribution</p>
            <TransactionStatus transactions={transactions} />
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.85fr)]">
          <div className="rounded-md border border-[#e2e8f0] bg-[#f8fafc] p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <span className="text-[8px] font-bold tracking-[1px] text-[#64748b]">ACTION REQUIRED</span>
                <h2 className="mt-1 font-display text-[15px] font-bold text-[#173b63]">Overdue follow-up</h2>
              </div>
              <button type="button" onClick={() => onNavigate('circulation', 'Overdue')} className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-[#64748b] hover:text-[#64748b]">
                View all <ArrowRight size={13} />
              </button>
            </div>
            {overdue.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left">
                  <thead><tr className="bg-[#fafbf9] text-[8px] uppercase tracking-[.45px] text-[#64748b]"><th className="px-3 py-2 font-bold">Borrower</th><th className="px-3 py-2 font-bold">Book</th><th className="px-3 py-2 font-bold">Due</th><th className="px-3 py-2 font-bold">Action</th></tr></thead>
                  <tbody>{overdue.slice(0, 4).map((item) => (
                    <tr key={item.id} className="border-t border-[#e2e8f0] text-[9px] text-[#64748b]">
                      <td className="px-3 py-2.5"><div className="flex items-center gap-2"><Avatar name={item.borrower} /><div><strong className="block font-semibold text-[#173b63]">{item.borrower}</strong><span className="text-[8px] text-[#94a3b8]">{item.borrowerId}</span></div></div></td>
                      <td className="px-3 py-2.5 font-medium text-[#64748b]">{item.title}</td>
                      <td className="px-3 py-2.5"><span className="font-semibold text-[#b85f50]">{daysLate(item.due)} days late</span></td>
                      <td className="px-3 py-2.5"><button type="button" onClick={() => onRecordReturn(item)} className="inline-flex items-center gap-1 text-[9px] font-semibold text-[#64748b] hover:text-[#64748b]"><RotateCcw size={12} /> Return</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            ) : <div className="flex items-center gap-3 rounded border border-[#dce8df] bg-[#f8fcf8] p-4 text-[10px] text-[#365d49]"><CheckCircle2 size={17} /> No overdue books need attention today.</div>}
          </div>

          <div className="rounded-md border border-[#e2e8f0] bg-[#f8fafc] p-5">
            <div className="mb-4 flex items-start justify-between">
              <div><span className="text-[8px] font-bold tracking-[1px] text-[#64748b]">TODAY'S QUEUE</span><h2 className="mt-1 font-display text-[15px] font-bold text-[#173b63]">Due soon</h2></div>
              <CalendarClock className="text-[#64748b]" size={18} />
            </div>
            <div className="space-y-1">{dueSoon.length ? dueSoon.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 border-t border-[#e2e8f0] py-2.5 text-[9px]">
                <div className="min-w-0"><strong className="block truncate text-[#173b63]">{item.title}</strong><span className="text-[8px] text-[#94a3b8]">{item.borrower}</span></div>
                <span className="shrink-0 text-[#64748b]">{formatDate(item.due)}</span>
              </div>
            )) : <p className="text-[10px] text-[#64748b]">No books are due soon.</p>}</div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
          <div className="overflow-hidden rounded-[18px] border border-[#e3e7ed] bg-white shadow-[0_2px_5px_rgba(15,23,42,0.04)]">
            <div className="flex items-start justify-between px-6 pb-4 pt-5">
              <div><h2 className="text-base font-bold text-[#111827]">Recent Transactions</h2><p className="mt-1 text-sm text-[#64748b]">Latest borrowing activity</p></div>
              <button type="button" onClick={() => onNavigate('circulation')} className="inline-flex items-center gap-1.5 pt-1 text-sm font-medium text-[#111827] hover:text-[#684a37]">View all <ArrowRight size={16} /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left">
                <thead><tr className="border-b border-[#e3e7ed] text-xs uppercase tracking-wide text-[#64748b]"><th className="px-6 py-3 font-medium">Book</th><th className="px-4 py-3 font-medium">Borrower</th><th className="px-4 py-3 font-medium">Due</th><th className="px-4 py-3 font-medium">Status</th></tr></thead>
                <tbody>{transactions.slice(0, 6).map((item) => {
                  const book = books.find((entry) => entry.id === item.bookId)
                  return <tr key={item.id} className="border-b border-[#e3e7ed] last:border-0">
                    <td className="px-6 py-3"><div className="flex items-center gap-3"><div className="h-12 w-9 shrink-0 overflow-hidden rounded-lg"><div className="h-full w-full scale-[.23] origin-top-left" style={{ width: '390%', height: '390%' }}><CoverArt book={book || { ...item, category: 'Library', tone: 'cover-new', author: '' }} /></div></div><strong className="max-w-[360px] truncate text-sm font-medium text-[#111827]">{item.title}</strong></div></td>
                    <td className="px-4 py-3 text-sm text-[#64748b]">{item.borrower}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-[#64748b]">{formatDate(item.due)}</td>
                    <td className="px-4 py-3"><StatusPill status={item.status} /></td>
                  </tr>
                })}</tbody>
              </table>
            </div>
          </div>
          <div className="rounded-[18px] border border-[#e3e7ed] bg-white p-5 shadow-[0_2px_5px_rgba(15,23,42,0.04)]">
            <div className="mb-4"><h2 className="text-base font-bold text-[#111827]">Most Borrowed</h2><p className="mt-1 text-sm text-[#64748b]">All-time popular titles</p></div>
            <div>{popularBooks.slice(0, 5).map((book, index) => {
              const maxBorrowed = popularBooks[0]?.borrowed || 1
              return <button key={book.id} type="button" onClick={() => onNavigate('books', book)} className="flex w-full items-center gap-3 py-2.5 text-left">
                <span className="w-4 text-base text-[#64748b]">{index + 1}</span>
                <div className="h-12 w-9 shrink-0 overflow-hidden rounded-lg"><div className="h-full w-full scale-[.23] origin-top-left" style={{ width: '390%', height: '390%' }}><CoverArt book={book} /></div></div>
                <div className="min-w-0 flex-1"><strong className="block truncate text-sm font-medium text-[#111827]">{book.title}</strong><span className="mt-2 block h-2 overflow-hidden rounded-full bg-[#edf0f3]"><span className="block h-full rounded-full bg-[#173b63]" style={{ width: `${(book.borrowed / maxBorrowed) * 100}%` }} /></span></div>
                <strong className="text-sm text-[#111827]">{book.borrowed}</strong>
              </button>
            })}</div>
          </div>
        </section>

        <div className="mt-4 flex items-center gap-2 rounded border border-[#e2e8f0] bg-[#f9fbf8] px-4 py-3 text-[9px] text-[#64748b]"><AlertCircle size={15} className="text-[#64748b]" /> Remember to review returns and update shelf availability before closing.</div>
      </div>
    </main>
  )
}