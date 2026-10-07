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
      <TransactionTable transactions={mine} />
    </section>
  </>
}
