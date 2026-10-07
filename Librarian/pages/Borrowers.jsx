import { useMemo, useState } from 'react'
import { Activity, AlertCircle, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Bell, BookCopy, BookOpen, Bookmark, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Download, FileBarChart2, Filter, LibraryBig, MoreHorizontal, Plus, Search, Settings, ShieldCheck, SlidersHorizontal, Sparkles, Trash2, TrendingUp, UserRound, Users, X } from 'lucide-react'
import { ActivityChart, Avatar, ConfirmDialog, CoverArt, DonutChart, IssueForm, Modal, RecordForm, StatusPill, TransactionTable } from '../components/LibraryShared.jsx'
import { daysLate, formatDate, hashPassword, money, normalizeEmail, today } from '../lib/helpers.js'

export function BorrowersPage({ borrowers, setBorrowers, transactions, onToast }) {
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const visible = borrowers.filter((borrower) => `${borrower.name} ${borrower.id} ${borrower.email} ${borrower.course}`.toLowerCase().includes(query.toLowerCase()))
  const save = (record) => { setBorrowers((current) => editing ? current.map((item) => item.id === editing.id ? record : item) : [record, ...current]); setModal(false); setEditing(null); onToast(editing ? 'Borrower profile updated' : 'Borrower added') }
  return <>
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-[#173b63]">Manage member profiles and keep track of their activity.</p>
      <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173b63] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173b63]" onClick={() => { setEditing(null); setModal(true) }}><Plus size={16} />Add borrower</button>
    </div>
    <section className="rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="flex w-full max-w-md items-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm text-[#64748b]">
          <Search size={16} />
          <input className="w-full bg-transparent text-[#173b63] outline-none placeholder:text-[#64748b]" placeholder="Search name, student ID, or email…" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <span className="inline-flex items-center rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">{visible.length} members</span>
      </div>
      <div className="overflow-x-auto"><table className="min-w-full text-left text-sm text-[#173b63]"><thead className="bg-[#f8fafc] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#64748b]"><tr><th className="px-4 py-3">Borrower</th><th className="px-4 py-3">Student ID</th><th className="px-4 py-3">Program</th><th className="px-4 py-3">Books out</th><th className="px-4 py-3">Member since</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr></thead><tbody>{visible.map((borrower) => <tr key={borrower.id} className="border-t border-[#e2e8f0] align-middle"><td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar name={borrower.name} /><div><strong className="block text-sm font-semibold text-[#173b63]">{borrower.name}</strong><span className="text-xs text-[#64748b]">{borrower.email}</span></div></div></td><td className="px-4 py-3">{borrower.id}</td><td className="px-4 py-3">{borrower.course}</td><td className="px-4 py-3"><strong className="text-[#173b63]">{transactions.filter((item) => item.borrowerId === borrower.id && item.status !== 'Returned').length}</strong></td><td className="px-4 py-3">{formatDate(borrower.joined)}</td><td className="px-4 py-3"><StatusPill status={borrower.status} /></td><td className="px-4 py-3"><div className="flex items-center justify-end gap-2"><button className="inline-grid h-9 w-9 place-items-center rounded-md text-[#64748b] transition hover:bg-[#e2e8f0] hover:text-[#173b63]" aria-label={`Edit ${borrower.name}`} onClick={() => { setEditing(borrower); setModal(true) }}><Settings size={15} /></button><button className="inline-grid h-9 w-9 place-items-center rounded-md text-red-500 transition hover:bg-red-50" aria-label={`Delete ${borrower.name}`} onClick={() => setDeleting(borrower)}><Trash2 size={15} /></button></div></td></tr>)}{!visible.length && <tr><td colSpan="7" className="px-4 py-8 text-center text-sm text-[#64748b]">No borrowers found.</td></tr>}</tbody></table></div></section>
    {modal && <RecordForm kind="borrower" record={editing} onSave={save} onClose={() => setModal(false)} />}
    {deleting && <ConfirmDialog title="Delete borrower?" message={`Remove ${deleting.name} (${deleting.id}) from the borrower list? Existing transaction history will be kept.`} onClose={() => setDeleting(null)} onConfirm={() => { setBorrowers((current) => current.filter((item) => item.id !== deleting.id)); setDeleting(null); onToast('Borrower removed') }} />}
  </>
}
