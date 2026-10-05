import { useEffect, useMemo, useState } from 'react'
import { Activity, AlertCircle, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Bell, BookCopy, BookOpen, Bookmark, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Download, FileBarChart2, Filter, LibraryBig, MoreHorizontal, Plus, Search, Settings, ShieldCheck, SlidersHorizontal, Sparkles, Trash2, TrendingUp, UserRound, Users, X } from 'lucide-react'
import { ActivityChart, Avatar, ConfirmDialog, CoverArt, DonutChart, IssueForm, Modal, RecordForm, StatusPill, TransactionTable } from '../components/LibraryShared.jsx'
import { daysLate, formatDate, hashPassword, money, normalizeEmail, today } from '../lib/helpers.js'

export function SettingsPage({ settings, setSettings, onToast }) {
  const [draft, setDraft] = useState(settings)
  useEffect(() => setDraft(settings), [settings])
  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }))
  const save = (event) => { event.preventDefault(); setSettings(draft); onToast('Library settings saved') }
  return <form onSubmit={save}>
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-[#173b63]">Set your library profile, lending rules, and account protections.</p>
      <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173b63] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173b63]"><Check size={15} />Save changes</button>
    </div>
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-100 text-[#64748b]"><LibraryBig size={18} /></span><div><h2 className="text-lg font-bold text-[#173b63]">Library profile</h2><p className="text-sm text-[#64748b]">How your library appears to its members.</p></div></div>
        <label className="mb-4 block text-sm font-medium text-[#173b63]">Library name<input className="mt-1 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-sm text-[#173b63] outline-none transition focus:border-[#173b63] focus:bg-[#f8fafc] focus:ring-2 focus:ring-[#173b63]/10" value={draft.libraryName} onChange={(event) => update('libraryName', event.target.value)} /></label>
        <label className="block text-sm font-medium text-[#173b63]">Contact email<input type="email" className="mt-1 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-sm text-[#173b63] outline-none transition focus:border-[#173b63] focus:bg-[#f8fafc] focus:ring-2 focus:ring-[#173b63]/10" value={draft.email} onChange={(event) => update('email', event.target.value)} /></label>
      </section>
      <section className="rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-700"><Bookmark size={18} /></span><div><h2 className="text-lg font-bold text-[#173b63]">Lending policy</h2><p className="text-sm text-[#64748b]">Default limits applied to new borrowings.</p></div></div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-[#173b63]">Borrowing period <span className="mt-1 flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5"><input type="number" min="1" className="w-full bg-transparent text-sm text-[#173b63] outline-none" value={draft.loanDays} onChange={(event) => update('loanDays', event.target.value)} /><i className="text-xs font-semibold uppercase tracking-[0.12em] text-[#64748b]">days</i></span></label>
          <label className="block text-sm font-medium text-[#173b63]">Maximum books <span className="mt-1 flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5"><input type="number" min="1" className="w-full bg-transparent text-sm text-[#173b63] outline-none" value={draft.maxBooks} onChange={(event) => update('maxBooks', event.target.value)} /><i className="text-xs font-semibold uppercase tracking-[0.12em] text-[#64748b]">books</i></span></label>
          <label className="block text-sm font-medium text-[#173b63]">Late fine <span className="mt-1 flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5"><input type="number" min="0" className="w-full bg-transparent text-sm text-[#173b63] outline-none" value={draft.fineRate} onChange={(event) => update('fineRate', event.target.value)} /><i className="text-xs font-semibold uppercase tracking-[0.12em] text-[#64748b]">PHP / day</i></span></label>
          <label className="block text-sm font-medium text-[#173b63]">Renewals allowed <span className="mt-1 flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5"><input type="number" min="0" className="w-full bg-transparent text-sm text-[#173b63] outline-none" value={draft.renewals} onChange={(event) => update('renewals', event.target.value)} /><i className="text-xs font-semibold uppercase tracking-[0.12em] text-[#64748b]">times</i></span></label>
        </div>
      </section>
      <section className="rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-100 text-rose-700"><Bell size={18} /></span><div><h2 className="text-lg font-bold text-[#173b63]">Notifications</h2><p className="text-sm text-[#64748b]">Choose which reminders the library sends.</p></div></div>
        <div className="space-y-4">
          <ToggleRow title="Due date reminders" description="Notify borrowers before a book is due." checked={draft.dueReminders} onChange={(value) => update('dueReminders', value)} />
          <ToggleRow title="Overdue alerts" description="Alert staff when borrowed books pass their due date." checked={draft.overdueAlerts} onChange={(value) => update('overdueAlerts', value)} />
          <ToggleRow title="New arrival digest" description="Send members a digest of new titles." checked={draft.newArrivals} onChange={(value) => update('newArrivals', value)} />
        </div>
      </section>
      <section className="rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><ShieldCheck size={18} /></span><div><h2 className="text-lg font-bold text-[#173b63]">Security</h2><p className="text-sm text-[#64748b]">Protect staff accounts and library records.</p></div></div>
        <div className="space-y-4">
          <ToggleRow title="Two-factor authentication" description="Require an additional verification step for staff." checked={draft.twoFactor} onChange={(value) => update('twoFactor', value)} />
          <label className="block text-sm font-medium text-[#173b63]">Automatic session timeout<select className="mt-1 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-sm text-[#173b63] outline-none transition focus:border-[#173b63] focus:bg-[#f8fafc] focus:ring-2 focus:ring-[#173b63]/10" value={draft.sessionTimeout} onChange={(event) => update('sessionTimeout', event.target.value)}><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">1 hour</option><option value="120">2 hours</option></select></label>
          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"><ShieldCheck size={15} />Passwords are protected and access is role-based.</div>
        </div>
      </section>
    </div>
  </form>
}

export function ToggleRow({ title, description, checked, onChange }) {
  return <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-3"><div><strong className="block text-sm font-semibold text-[#173b63]">{title}</strong><span className="mt-1 block text-xs text-[#64748b]">{description}</span></div><button className={`relative inline-flex h-7 w-12 items-center rounded-full border transition ${checked ? 'border-[#173b63] bg-[#173b63]' : 'border-[#94a3b8] bg-[#94a3b8]'}`} type="button" role="switch" aria-checked={checked} aria-label={title} onClick={() => onChange(!checked)}><span className={`absolute h-5 w-5 rounded-full bg-[#f8fafc] shadow-sm transition ${checked ? 'left-6' : 'left-1'}`} /></button></div>
}
