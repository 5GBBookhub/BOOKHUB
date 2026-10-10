import { useMemo, useState } from 'react'
import { Activity, AlertCircle, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Bell, BookCopy, BookOpen, Bookmark, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock3, Download, FileBarChart2, Filter, LibraryBig, MoreHorizontal, Plus, Search, Settings, ShieldCheck, SlidersHorizontal, Sparkles, Trash2, TrendingUp, UserRound, Users, X } from 'lucide-react'
import { ActivityChart, Avatar, ConfirmDialog, CoverArt, DonutChart, IssueForm, Modal, RecordForm, StatusPill, TransactionTable } from '../../Librarian/components/LibraryShared.jsx'
import { daysLate, formatDate, hashPassword, money, normalizeEmail, today } from '../../Librarian/lib/helpers.js'

export function Dashboard({ books, borrowers, transactions, onNavigate }) {
  const activeLoans = transactions.filter((item) => ['Pending', 'Borrowed', 'Overdue'].includes(item.status)).length
  const overdue = transactions.filter((item) => item.status === 'Overdue' || (item.status === 'Borrowed' && daysLate(item.due) > 0)).length
  const totalCopies = books.reduce((sum, book) => sum + book.copies, 0)
  const topBooks = [...books].sort((a, b) => b.borrowed - a.borrowed).slice(0, 4)
  return (
    <>
      <div className="mb-6 rounded-[26px] border border-[#e2e8f0] bg-[#684a37] p-5 text-white shadow-[0_18px_38px_rgba(104,74,55,0.2)] md:flex md:items-center md:justify-between">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">DAILY LIBRARY SUMMARY</span>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Your library, in good order.</h1>
          <p className="mt-2 text-sm text-white/80">Here’s the latest from the BookHub Library.</p>
        </div>
        <button className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#f8fafc]/12 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-[#f8fafc]/18 md:mt-0" onClick={() => onNavigate('circulation')}><Plus size={16} />Issue a book</button>
        <div className="hidden md:block"><LibraryBig size={74} strokeWidth={1} className="text-white/80" /></div>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total book copies" value={totalCopies.toLocaleString()} change="Across the catalog" icon={BookOpen} color="blue" onClick={() => onNavigate('books')} />
        <StatCard label="Currently borrowed" value={activeLoans} change="Books borrowed" icon={BookCopy} color="gold" onClick={() => onNavigate('circulation')} />
        <StatCard label="Active borrowers" value={borrowers.filter((item) => item.status === 'Active').length} change="Registered members" icon={Users} color="green" onClick={() => onNavigate('borrowers')} />
        <StatCard label="Overdue items" value={overdue} change={overdue ? 'Needs attention' : 'All caught up'} icon={Clock3} color="coral" onClick={() => onNavigate('circulation')} alert={overdue > 0} />
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
          <div className="mb-4 flex items-center justify-between gap-3"><div><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">LIBRARY PULSE</span><h2 className="mt-1 text-xl font-bold text-[#173b63]">Borrowing activity</h2></div><button className="inline-flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-1.5 text-xs font-semibold text-[#173b63]">Last 7 months <ChevronDown size={14} /></button></div>
          <div className="mb-3 flex items-center gap-3"><strong className="text-3xl font-black tracking-tight text-[#173b63]">1,284</strong><span className="text-sm text-[#64748b]">books checked out</span><span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"><TrendingUp size={14} />12.8%</span></div>
          <ActivityChart />
        </div>
        <div className="rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
          <div className="mb-4 flex items-center justify-between gap-3"><div><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">AT A GLANCE</span><h2 className="mt-1 text-xl font-bold text-[#173b63]">Transaction status</h2></div><button className="inline-grid h-9 w-9 place-items-center rounded-md text-[#64748b] transition hover:bg-[#e2e8f0]" aria-label="Transaction status details"><MoreHorizontal size={19} /></button></div>
          <DonutChart transactions={transactions} />
          <button className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#173b63]" onClick={() => onNavigate('circulation')}>View all transactions <ArrowRight size={14} /></button>
        </div>
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
          <div className="mb-4 flex items-center justify-between gap-3"><div><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">THE LATEST</span><h2 className="mt-1 text-xl font-bold text-[#173b63]">Recent transactions</h2></div><button className="text-sm font-semibold text-[#173b63]" onClick={() => onNavigate('circulation')}>See all <ArrowRight size={14} className="inline" /></button></div>
          <TransactionTable transactions={transactions} limit={5} />
        </div>
        <div className="rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
          <div className="mb-4 flex items-center justify-between gap-3"><div><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">READER FAVORITES</span><h2 className="mt-1 text-xl font-bold text-[#173b63]">Most borrowed</h2></div><button className="inline-grid h-9 w-9 place-items-center rounded-md text-[#64748b] transition hover:bg-[#e2e8f0]" aria-label="More most borrowed actions"><MoreHorizontal size={19} /></button></div>
          <div className="space-y-3">{topBooks.map((book, index) => <button className="flex w-full items-center gap-3 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-2 text-left transition hover:border-[#94a3b8] hover:bg-[#e2e8f0]" key={book.id} onClick={() => onNavigate('books', book)}><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#173b63] text-xs font-bold text-white">0{index + 1}</span><div className="w-[90px] shrink-0"><CoverArt book={book} compact /></div><span className="min-w-0 flex-1"><strong className="block truncate text-sm font-semibold text-[#173b63]">{book.title}</strong><span className="block truncate text-xs text-[#64748b]">{book.author}</span></span><span className="flex items-center gap-1 text-sm font-bold text-[#173b63]">{book.borrowed}<small className="text-xss text-[#64748b]">borrowed</small></span></button>)}</div>
        </div>
      </section>
    </>
  )
}

export function StatCard({ label, value, change, icon: Icon, color, onClick, alert }) {
  const tones = {
    blue: 'bg-[#e8d8c8] text-[#684a37]',
    gold: 'bg-amber-100 text-amber-700',
    green: 'bg-emerald-100 text-emerald-700',
    coral: 'bg-rose-100 text-rose-700',
  }
  return <button className="group rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-4 text-left shadow-[0_12px_30px_rgba(15,23,42,0.04)] transition hover:border-[#94a3b8] hover:shadow-md" onClick={onClick}><div className="flex items-start justify-between gap-3"><span className={`grid h-11 w-11 place-items-center rounded-xl ${tones[color]}`}><Icon size={19} /></span><ArrowUpRight className="text-[#64748b] transition group-hover:text-[#173b63]" size={16} /></div><span className="mt-4 block text-sm text-[#64748b]">{label}</span><strong className="mt-1 block text-3xl font-black tracking-tight text-[#173b63]">{value}</strong><span className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${alert ? 'text-rose-600' : 'text-[#64748b]'}`}>{alert && <AlertCircle size={13} />}{change}</span></button>
}
