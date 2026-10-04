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
  Users,
} from 'lucide-react'
import {
  initialBooks,
  initialBorrowers,
  initialTransactions,
} from '../../src/data.js'

const today = () => new Date().toISOString().slice(0, 10)
const formatDate = (value) => value
  ? new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  : '—'
const daysLate = (due) => Math.max(0, Math.floor(
  (new Date(`${today()}T00:00:00`) - new Date(`${due}T00:00:00`)) / 86400000,
))

const statusStyles = {
  Borrowed: 'bg-[#e8f0f5] text-[#315f83]',
  Overdue: 'bg-[#f8eae6] text-[#b45e50]',
  Returned: 'bg-[#e8f2eb] text-[#4b8068]',
}

function Avatar({ name }) {
  const initials = name.split(' ').map((part) => part[0]).slice(0, 2).join('')
  return (
    <span className="inline-grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e5d8ad] text-[9px] font-bold text-[#20446a]">
      {initials}
    </span>
  )
}

function StatusPill({ status }) {
  return (
    <span className={`inline-flex min-h-[21px] items-center gap-1.5 rounded-xl px-2 text-[8px] font-semibold ${statusStyles[status] || 'bg-slate-100 text-slate-600'}`}>
      <i className="h-[5px] w-[5px] rounded-full bg-current" />
      {status}
    </span>
  )
}

function MetricCard({ label, value, detail, icon: Icon, tone, onClick }) {
  const tones = {
    blue: 'bg-[#e5edf4] text-[#28567f]',
    gold: 'bg-[#f7efd8] text-[#94721d]',
    green: 'bg-[#e6f0e9] text-[#4f816b]',
    coral: 'bg-[#f6e9e5] text-[#b96353]',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex min-h-[126px] flex-col items-start rounded-md border border-[#e9ebe8] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(28,50,67,.065)]"
    >
      <span className={`grid h-9 w-9 place-items-center rounded-lg ${tones[tone]}`}><Icon size={19} /></span>
      <span className="absolute left-[68px] top-5 text-[10px] text-[#73818c]">{label}</span>
      <strong className="mt-3 font-display text-[24px] leading-none text-[#18334d]">{value}</strong>
      <span className="mt-2 text-[9px] text-[#98a2a8]">{detail}</span>
      <ArrowRight className="absolute right-4 top-5 text-[#a3adb2] transition group-hover:translate-x-0.5" size={15} />
    </button>
  )
}

export default function LibrarianDashboard({
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
    <main className="min-h-screen bg-[#f4f5f2] px-5 py-6 font-sans text-[#192c3e] sm:px-8">
      <div className="mx-auto max-w-[1500px]">
        <section className="relative mb-4 overflow-hidden rounded-md bg-[#173b63] px-6 py-6 text-white shadow-sm sm:px-8">
          <div className="relative z-10 max-w-[620px]">
            <span className="text-[8px] font-bold tracking-[1px] text-[#dfc678]">LIBRARIAN WORKSPACE</span>
            <h1 className="mt-2 font-display text-[25px] font-bold leading-tight sm:text-[29px]">Good morning, {userName}.</h1>
            <p className="mt-2 text-[11px] text-[#c3d0da]">Keep the shelves moving and every reader on track.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={onIssueBook} className="inline-flex h-9 items-center gap-2 rounded border border-white/50 bg-white px-3 text-[10px] font-semibold text-[#203b53] transition hover:bg-[#fbf5e6]">
                <Plus size={15} /> Issue a book
              </button>
              <button type="button" onClick={() => onNavigate('books')} className="inline-flex h-9 items-center gap-2 rounded border border-white/25 bg-white/10 px-3 text-[10px] font-semibold text-white transition hover:bg-white/20">
                <Search size={14} /> Browse catalog
              </button>
            </div>
          </div>
          <LibraryBig className="absolute -bottom-5 right-8 rotate-[-9deg] text-[rgba(235,199,105,.28)]" size={120} strokeWidth={1} />
        </section>

        <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Books on loan" value={activeLoans.length} detail="Active circulation" icon={BookCopy} tone="blue" onClick={() => onNavigate('circulation')} />
          <MetricCard label="Overdue items" value={overdue.length} detail={overdue.length ? 'Needs follow-up' : 'All caught up'} icon={Clock3} tone="coral" onClick={() => onNavigate('circulation', 'Overdue')} />
          <MetricCard label="Available copies" value={availableCopies} detail={`${totalCopies} copies in collection`} icon={BookOpen} tone="green" onClick={() => onNavigate('books')} />
          <MetricCard label="Active borrowers" value={borrowers.filter((item) => item.status === 'Active').length} detail="Registered members" icon={Users} tone="gold" onClick={() => onNavigate('borrowers')} />
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.85fr)]">
          <div className="rounded-md border border-[#e8eae7] bg-white p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <span className="text-[8px] font-bold tracking-[1px] text-[#87949d]">ACTION REQUIRED</span>
                <h2 className="mt-1 font-display text-[15px] font-bold text-[#1d354b]">Overdue follow-up</h2>
              </div>
              <button type="button" onClick={() => onNavigate('circulation', 'Overdue')} className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-[#365d7c] hover:text-[#b1841f]">
                View all <ArrowRight size={13} />
              </button>
            </div>
            {overdue.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left">
                  <thead><tr className="bg-[#fafbf9] text-[8px] uppercase tracking-[.45px] text-[#87939b]"><th className="px-3 py-2 font-bold">Borrower</th><th className="px-3 py-2 font-bold">Book</th><th className="px-3 py-2 font-bold">Due</th><th className="px-3 py-2 font-bold">Action</th></tr></thead>
                  <tbody>{overdue.slice(0, 4).map((item) => (
                    <tr key={item.id} className="border-t border-[#eff1ee] text-[9px] text-[#687782]">
                      <td className="px-3 py-2.5"><div className="flex items-center gap-2"><Avatar name={item.borrower} /><div><strong className="block font-semibold text-[#314a5e]">{item.borrower}</strong><span className="text-[8px] text-[#9aa4aa]">{item.borrowerId}</span></div></div></td>
                      <td className="px-3 py-2.5 font-medium text-[#3c5262]">{item.title}</td>
                      <td className="px-3 py-2.5"><span className="font-semibold text-[#b85f50]">{daysLate(item.due)} days late</span></td>
                      <td className="px-3 py-2.5"><button type="button" onClick={() => onRecordReturn(item)} className="inline-flex items-center gap-1 text-[9px] font-semibold text-[#315e7b] hover:text-[#ab7f20]"><RotateCcw size={12} /> Return</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            ) : <div className="flex items-center gap-3 rounded border border-[#dce8df] bg-[#f8fcf8] p-4 text-[10px] text-[#365d49]"><CheckCircle2 size={17} /> No overdue books need attention today.</div>}
          </div>

          <div className="rounded-md border border-[#e8eae7] bg-white p-5">
            <div className="mb-4 flex items-start justify-between">
              <div><span className="text-[8px] font-bold tracking-[1px] text-[#87949d]">TODAY'S QUEUE</span><h2 className="mt-1 font-display text-[15px] font-bold text-[#1d354b]">Due soon</h2></div>
              <CalendarClock className="text-[#a18438]" size={18} />
            </div>
            <div className="space-y-1">{dueSoon.length ? dueSoon.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 border-t border-[#eff1ee] py-2.5 text-[9px]">
                <div className="min-w-0"><strong className="block truncate text-[#314a5e]">{item.title}</strong><span className="text-[8px] text-[#9aa4aa]">{item.borrower}</span></div>
                <span className="shrink-0 text-[#7b8890]">{formatDate(item.due)}</span>
              </div>
            )) : <p className="text-[10px] text-[#8b979e]">No books are due soon.</p>}</div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.85fr)]">
          <div className="rounded-md border border-[#e8eae7] bg-white p-5">
            <div className="mb-3 flex items-center justify-between"><div><span className="text-[8px] font-bold tracking-[1px] text-[#87949d]">RECENT ACTIVITY</span><h2 className="mt-1 font-display text-[15px] font-bold text-[#1d354b]">Latest transactions</h2></div><Bell className="text-[#a18438]" size={17} /></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[500px] border-collapse text-left"><thead><tr className="bg-[#fafbf9] text-[8px] uppercase tracking-[.45px] text-[#87939b]"><th className="px-3 py-2 font-bold">Borrower</th><th className="px-3 py-2 font-bold">Title</th><th className="px-3 py-2 font-bold">Due date</th><th className="px-3 py-2 font-bold">Status</th></tr></thead><tbody>{transactions.slice(0, 5).map((item) => <tr key={item.id} className="border-t border-[#eff1ee] text-[9px]"><td className="px-3 py-2.5 font-semibold text-[#314a5e]">{item.borrower}</td><td className="px-3 py-2.5 text-[#687782]">{item.title}</td><td className="px-3 py-2.5 text-[#687782]">{formatDate(item.due)}</td><td className="px-3 py-2.5"><StatusPill status={item.status} /></td></tr>)}</tbody></table></div>
          </div>
          <div className="rounded-md border border-[#e8eae7] bg-white p-5">
            <div className="mb-3 flex items-center justify-between"><div><span className="text-[8px] font-bold tracking-[1px] text-[#87949d]">READER FAVORITES</span><h2 className="mt-1 font-display text-[15px] font-bold text-[#1d354b]">Most borrowed titles</h2></div><BookOpen className="text-[#a18438]" size={17} /></div>
            <div>{popularBooks.map((book, index) => <button key={book.id} type="button" onClick={() => onNavigate('books', book)} className="flex w-full items-center gap-3 border-t border-[#eff1ee] py-2.5 text-left first:border-t-0"><span className="font-display text-[9px] font-bold text-[#9aa4a9]">0{index + 1}</span><div className="min-w-0 flex-1"><strong className="block truncate text-[10px] font-semibold text-[#314a5e]">{book.title}</strong><span className="block truncate text-[8px] text-[#9aa4aa]">{book.author}</span></div><span className="text-right text-[10px] font-bold text-[#29445c]">{book.borrowed}<small className="ml-1 text-[8px] font-normal text-[#94a0a5]">loans</small></span></button>)}</div>
          </div>
        </section>

        <div className="mt-4 flex items-center gap-2 rounded border border-[#e4e9e7] bg-[#f9fbf8] px-4 py-3 text-[9px] text-[#819098]"><AlertCircle size={15} className="text-[#a18438]" /> Remember to review returns and update shelf availability before closing.</div>
      </div>
    </main>
  )
}