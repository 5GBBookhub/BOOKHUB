import { useMemo, useState } from 'react'
import { Activity, AlertCircle, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Bell, BookCopy, BookOpen, Bookmark, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock3, Download, FileBarChart2, Filter, LibraryBig, MoreHorizontal, Plus, Search, Settings, ShieldCheck, SlidersHorizontal, Sparkles, Trash2, TrendingUp, UserRound, Users, X } from 'lucide-react'
import { ActivityChart, Avatar, ConfirmDialog, CoverArt, DonutChart, IssueForm, Modal, RecordForm, StatusPill, TransactionTable } from '../../Librarian/components/LibraryShared.jsx'
import { daysLate, formatDate, hashPassword, money, normalizeEmail, today } from '../../Librarian/lib/helpers.js'

export function MemberAccountPage({ session, borrowers, transactions }) {
  const borrower = borrowers.find((item) => item.email.toLowerCase() === session.email.toLowerCase())
  if (!borrower) return <section className="rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-5 text-[#173b63] shadow-[0_12px_30px_rgba(15,23,42,0.04)]"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-sky-100 text-[#64748b]"><UserRound size={18} /></span><div><h2 className="text-xl font-bold text-[#173b63]">Library account not linked</h2><p className="mt-1 text-sm text-[#173b63]">We couldn't find a borrower profile for {session.email}. Ask library staff to connect your account so your borrowed books appear here.</p></div></div></section>
  const mine = transactions.filter((item) => item.borrowerId === borrower.id).sort((a, b) => b.issued.localeCompare(a.issued))
  const active = mine.filter((item) => item.status !== 'Returned')
  const late = active.filter((item) => item.status === 'Overdue' || daysLate(item.due) > 0)
  return <>
    <div className="mb-6"><p className="text-sm text-[#173b63]">Your library profile and current borrowing activity.</p></div>
    <section className="flex flex-col gap-4 rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4"><Avatar name={borrower.name} /><div><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">NU LIBRARY MEMBER</span><h2 className="mt-1 text-2xl font-black tracking-tight text-[#173b63]">{borrower.name}</h2><p className="text-sm text-[#173b63]">{borrower.id} · {borrower.course}</p><span className="text-sm text-[#64748b]">{borrower.email}</span></div></div>
      <StatusPill status={borrower.status} />
    </section>
    <section className="mt-5 grid gap-4 md:grid-cols-3">
      <div className="rounded-[20px] border border-[#e2e8f0] bg-[#f8fafc] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-sky-100 text-[#64748b]"><BookCopy size={18} /></span><div><span className="text-sm text-[#64748b]">Books out</span><strong className="mt-1 block text-2xl font-black text-[#173b63]">{active.length}</strong></div></div></div>
      <div className="rounded-[20px] border border-[#e2e8f0] bg-[#f8fafc] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-rose-100 text-rose-700"><Clock3 size={18} /></span><div><span className="text-sm text-[#64748b]">Overdue</span><strong className="mt-1 block text-2xl font-black text-[#173b63]">{late.length}</strong></div></div></div>
      <div className="rounded-[20px] border border-[#e2e8f0] bg-[#f8fafc] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><CheckCircle2 size={18} /></span><div><span className="text-sm text-[#64748b]">Returned</span><strong className="mt-1 block text-2xl font-black text-[#173b63]">{mine.filter((item) => item.status === 'Returned').length}</strong></div></div></div>
    </section>
    <section className="mt-5 rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex items-center justify-between gap-3"><div><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">YOUR ACTIVITY</span><h2 className="mt-1 text-xl font-bold text-[#173b63]">Borrowing history</h2></div><span className="rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">{mine.length} records</span></div>
      <TransactionTable transactions={mine} showBorrowerColumn={false} />
    </section>
  </>
}

MemberAccountPage.MemberDashboard = function MemberDashboard({ session, borrowers, transactions, onNavigate }) {
  const borrower = borrowers.find((item) => item.email.toLowerCase() === session.email.toLowerCase())
  if (!borrower) return null

  const mine = transactions.filter((item) => item.borrowerId === borrower.id).sort((a, b) => b.issued.localeCompare(a.issued))
  const active = mine.filter((item) => item.status !== 'Returned')
  const overdue = active.filter((item) => item.status === 'Overdue' || daysLate(item.due) > 0)
  const dueSoon = active.filter((item) => item.status === 'Borrowed' && daysLate(item.due) <= 3 && daysLate(item.due) >= 0).length
  const recent = mine.slice(0, 4)

  return (
    <>
      <div className="mb-6 rounded-[26px] border border-[#e2e8f0] bg-[#684a37] p-5 text-white shadow-[0_18px_38px_rgba(104,74,55,0.2)] md:flex md:items-center md:justify-between">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">DAILY LIBRARY SUMMARY</span>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Your library, in good order.</h1>
          <p className="mt-2 text-sm text-white/80">Here’s your current borrowing status and recent activity.</p>
        </div>
        <button className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#f8fafc]/12 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-[#f8fafc]/18 md:mt-0" onClick={() => onNavigate('books')}><BookOpen size={16} />Browse books</button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Currently borrowed" value={active.length} detail="Books currently checked out" icon={BookCopy} color="blue" onClick={() => onNavigate('history')} />
        <StatCard label="Overdue" value={overdue.length} detail={overdue.length ? 'Needs attention' : 'All caught up'} icon={Clock3} color="coral" onClick={() => onNavigate('history')} alert={overdue.length > 0} />
        <StatCard label="Total books borrowed" value={mine.length} detail="All membership activity" icon={BookOpen} color="gold" onClick={() => onNavigate('history')} />
        <StatCard label="Active due" value={dueSoon} detail="Due in the next few days" icon={CheckCircle2} color="green" onClick={() => onNavigate('history')} />
      </section>

      <section className="mt-5 rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">RECENT ACTIVITY</span>
            <h2 className="mt-1 text-xl font-bold text-[#173b63]">Recent borrowed books</h2>
          </div>
          <button className="text-sm font-semibold text-[#173b63]" onClick={() => onNavigate('history')}>View history <ArrowRight size={14} className="inline" /></button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {recent.map((item) => (
            <div key={item.id} className="rounded-[18px] border border-[#e2e8f0] bg-white p-3 shadow-[0_8px_18px_rgba(15,23,42,0.03)]">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${item.status === 'Returned' ? 'bg-emerald-50 text-emerald-700' : item.status === 'Overdue' ? 'bg-rose-50 text-rose-700' : 'bg-[#e8d8c8] text-[#684a37]'}`}>
                  {item.status}
                </span>
                <span className="text-[10px] text-[#64748b]">{item.due}</span>
              </div>
              <strong className="block text-sm font-bold text-[#173b63]">{item.title}</strong>
              <span className="mt-1 block text-xs text-[#64748b]">{item.borrower}</span>
              <div className="mt-4 flex items-center justify-between text-[11px] text-[#64748b]">
                <span>Issued {item.issued}</span>
                <span>{item.status === 'Returned' ? 'Completed' : 'Open'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

MemberAccountPage.MemberHistory = function MemberHistory({ session, borrowers, transactions }) {
  const borrower = borrowers.find((item) => item.email.toLowerCase() === session.email.toLowerCase())
  if (!borrower) return null

  const mine = transactions.filter((item) => item.borrowerId === borrower.id).sort((a, b) => b.issued.localeCompare(a.issued))

  return (
    <section className="rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">PROFILE</span>
          <h2 className="mt-1 text-xl font-bold text-[#173b63]">History of borrowed books</h2>
        </div>
        <span className="rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">{mine.length} records</span>
      </div>
      <TransactionTable transactions={mine} showBorrowerColumn={false} />
    </section>
  )
}

function StatCard({ label, value, detail, icon: Icon, color, onClick, alert }) {
  const tones = {
    blue: 'bg-[#e8d8c8] text-[#684a37]',
    gold: 'bg-amber-100 text-amber-700',
    green: 'bg-emerald-100 text-emerald-700',
    coral: 'bg-rose-100 text-rose-700',
  }

  return (
    <button className="group rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-4 text-left shadow-[0_12px_30px_rgba(15,23,42,0.04)] transition hover:border-[#94a3b8] hover:shadow-md" onClick={onClick}>
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-11 w-11 place-items-center rounded-xl ${tones[color]}`}><Icon size={19} /></span>
        <ArrowUpRight className="text-[#64748b] transition group-hover:text-[#173b63]" size={16} />
      </div>
      <span className="mt-4 block text-sm text-[#64748b]">{label}</span>
      <strong className="mt-1 block text-3xl font-black tracking-tight text-[#173b63]">{value}</strong>
      <span className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${alert ? 'text-rose-600' : 'text-[#64748b]'}`}>{alert && <AlertCircle size={13} />}{detail}</span>
    </button>
  )
}
