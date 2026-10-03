import { useMemo, useState } from 'react'
import { Activity, AlertCircle, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Bell, BookCopy, BookOpen, Bookmark, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Download, FileBarChart2, Filter, LibraryBig, MoreHorizontal, Plus, Search, Settings, ShieldCheck, SlidersHorizontal, Sparkles, Trash2, TrendingUp, UserRound, Users, X } from 'lucide-react'
import { ActivityChart, Avatar, ConfirmDialog, CoverArt, DonutChart, IssueForm, Modal, RecordForm, StatusPill, TransactionTable } from '../../Librarian/components/LibraryShared.jsx'
import { daysLate, formatDate, hashPassword, money, normalizeEmail, today } from '../../Librarian/lib/helpers.js'

export function MemberAccountPage({ session, borrowers, transactions }) {
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
