import { useMemo, useState } from 'react'
import { Activity, AlertCircle, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Bell, BookCopy, BookOpen, Bookmark, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Download, FileBarChart2, Filter, LibraryBig, MoreHorizontal, Plus, Search, Settings, ShieldCheck, SlidersHorizontal, Sparkles, Trash2, TrendingUp, UserRound, Users, X } from 'lucide-react'
import { ActivityChart, Avatar, ConfirmDialog, CoverArt, DonutChart, IssueForm, Modal, RecordForm, StatusPill, TransactionTable } from '../components/LibraryShared.jsx'
import { daysLate, formatDate, hashPassword, money, normalizeEmail, today } from '../lib/helpers.js'

export function BookDetail({ book, onBack, onSaveBook, transactions, canEdit = true }) {
  const [editing, setEditing] = useState(false)
  const history = transactions.filter((item) => item.bookId === book.id).slice(0, 4)
  return <>
    <button className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#173b63] transition hover:text-[#173b63]" onClick={onBack}><ArrowLeft size={15} />Back to catalog</button>
    <section className="rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:p-6">
      <div className="grid gap-5 md:grid-cols-[250px_1fr] md:items-start">
        <div className="w-full max-w-[230px]"><CoverArt book={book} /></div>
        <div>
          <span className="inline-flex rounded-full bg-[#e2e8f0] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#173b63]">{book.category}</span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#173b63]">{book.title}</h1>
          <p className="mt-1 text-base text-[#173b63]">by {book.author}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#173b63]">
            <StatusPill status={book.available ? 'Available' : 'Checked out'} />
            <span>{book.available} available of {book.copies} copies</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3"><span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">Catalog ID</span><strong className="mt-1 block text-sm font-semibold text-[#173b63]">{book.id}</strong></div>
            <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3"><span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">ISBN</span><strong className="mt-1 block text-sm font-semibold text-[#173b63]">{book.isbn || 'Not listed'}</strong></div>
            <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3"><span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">Published</span><strong className="mt-1 block text-sm font-semibold text-[#173b63]">{book.year}</strong></div>
            <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3"><span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">Total checkouts</span><strong className="mt-1 block text-sm font-semibold text-[#173b63]">{book.borrowed}</strong></div>
          </div>
          {canEdit && <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#173b63] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173b63]" onClick={() => setEditing(true)}><Settings size={15} />Edit book details</button>}
        </div>
      </div>
    </section>
    <section className="mt-6 rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex items-center justify-between gap-3"><div><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">CIRCULATION</span><h2 className="mt-1 text-xl font-bold text-[#173b63]">Recent borrowing history</h2></div></div>
      <TransactionTable transactions={history} />
    </section>
    {editing && <RecordForm kind="book" record={book} onSave={(updated) => { onSaveBook(updated); setEditing(false) }} onClose={() => setEditing(false)} />}
  </>
}
