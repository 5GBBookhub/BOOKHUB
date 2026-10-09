import { useMemo, useState } from 'react'
import { Activity, AlertCircle, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Bell, BookCopy, BookOpen, Bookmark, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Download, FileBarChart2, Filter, LibraryBig, MoreHorizontal, Plus, Search, Settings, ShieldCheck, SlidersHorizontal, Sparkles, Trash2, TrendingUp, UserRound, Users, X } from 'lucide-react'
import { ActivityChart, Avatar, ConfirmDialog, CoverArt, DonutChart, IssueForm, Modal, RecordForm, StatusPill, TransactionTable } from '../components/LibraryShared.jsx'
import { daysLate, formatDate, hashPassword, money, normalizeEmail, today, generateAccountEmail } from '../lib/helpers.js'

export function StaffPage({ staff, setStaff, onToast }) {
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', role: 'Librarian', password: '' })
  const [formError, setFormError] = useState('')
  const open = (record = null) => {
    setEditing(record)
    setForm(record ? { name: record.name, email: record.email, role: record.role, password: '' } : { name: '', email: '', role: 'Librarian', password: '' })
    setFormError('')
    setModal(true)
  }
  const save = async (event) => {
    event.preventDefault()
    setFormError('')
    const email = editing
      ? normalizeEmail(form.email)
      : generateAccountEmail(form.name, 'lib.ph')
    if (!email) {
      setFormError('Enter a first name and surname to generate the librarian email.')
      return
    }
    if (staff.some((member) => member.id !== editing?.id && normalizeEmail(member.email) === email)) {
      setFormError('A staff account already uses this email address.')
      return
    }
    if (!editing && !form.password) {
      setFormError('Set a password before creating this account.')
      return
    }
    let credentials = {}
    try {
      credentials = form.password ? await hashPassword(form.password) : {}
    } catch {
      setFormError('Unable to secure the account password. Please try again.')
      return
    }
    const account = {
      id: editing?.id || `ST-${String(Date.now()).slice(-4)}`,
      name: form.name.trim(), email, role: form.role, status: editing?.status || 'Active',
      ...(form.password ? credentials : { passwordHash: editing?.passwordHash, passwordSalt: editing?.passwordSalt }),
    }
    setStaff((current) => editing ? current.map((item) => item.id === editing.id ? account : item) : [account, ...current])
    setModal(false)
    onToast(editing ? 'Staff account updated' : `Librarian account created: ${email}`)
  }
  return <>
    <div className="mb-6 flex items-center justify-between gap-3"><p className="text-sm text-[#173b63]">Control who can access BOOKHUB and what they can manage.</p><button className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(14,116,144,0.22)] transition hover:bg-sky-800" onClick={() => open()}><Plus size={16} />Add staff member</button></div>
    <section className="mb-5 flex items-center justify-between gap-4 rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]"><div className="flex items-center gap-4"><div className="grid h-11 w-11 place-items-center rounded-xl bg-sky-100 text-[#64748b]"><ShieldCheck size={23} /></div><div className="flex flex-col"><strong className="font-semibold text-[#173b63]">Access is role-based</strong><span className="text-sm text-[#173b63]">Administrators can manage users and system settings. Librarians can manage the catalog and circulation.</span></div></div><span className="rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">2 roles</span></section>
    <section className="rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]"><div className="mb-4 flex items-center justify-between gap-3"><div><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">TEAM ACCESS</span><h2 className="mt-1 text-xl font-bold text-[#173b63]">Library staff</h2></div><span className="rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">{staff.length} accounts</span></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-[#e2e8f0] text-[#64748b]"><tr><th className="py-3 pr-4 font-medium">Staff member</th><th className="py-3 pr-4 font-medium">Role</th><th className="py-3 pr-4 font-medium">Status</th><th className="py-3 pr-4 font-medium">Account ID</th><th className="py-3 font-medium" /></tr></thead><tbody>{staff.map((member) => <tr key={member.id} className="border-b border-[#e2e8f0] last:border-b-0"><td className="py-3 pr-4"><div className="flex items-center gap-3"><Avatar name={member.name} /><div className="flex flex-col"><strong className="font-semibold text-[#173b63]">{member.name}</strong><span className="text-xs text-[#64748b]">{member.email}</span></div></div></td><td className="py-3 pr-4"><span className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e8f0] bg-[#e2e8f0] px-2.5 py-1 text-xs font-semibold text-[#64748b]"><ShieldCheck size={14} />{member.role}</span></td><td className="py-3 pr-4"><StatusPill status={member.status} /></td><td className="py-3 pr-4 text-[#173b63]">{member.id}</td><td className="py-3"><div className="flex justify-end gap-2"><button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-[#64748b] transition hover:border-[#94a3b8] hover:text-[#173b63]" aria-label={`Edit ${member.name}`} onClick={() => open(member)}><Settings size={15} /></button><button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100" aria-label={`Delete ${member.name}`} onClick={() => setDeleting(member)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div></section>
    {modal && <Modal title={`${editing ? 'Edit' : 'Add'} staff account`} subtitle="Set login credentials and assign a role." onClose={() => setModal(false)}><form className="grid gap-4 md:grid-cols-2" onSubmit={save}>
      <label className="md:col-span-2 flex flex-col gap-1.5 text-sm font-medium text-[#173b63]">Full name<input className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-[#173b63] outline-none transition focus:border-sky-400 focus:bg-[#f8fafc]" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, email: editing ? form.email : generateAccountEmail(event.target.value, 'lib.ph') })} placeholder="Staff member name" /></label>
      <label className="md:col-span-2 flex flex-col gap-1.5 text-sm font-medium text-[#173b63]">{editing ? 'Email address' : 'Generated email'}<input className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-[#173b63] outline-none transition focus:border-sky-400 focus:bg-[#f8fafc] read-only:cursor-not-allowed read-only:bg-[#f1eae2]" type="email" required value={form.email} readOnly={!editing} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Surname + first initial@lib.ph" /></label>
      <label className="md:col-span-2 flex flex-col gap-1.5 text-sm font-medium text-[#173b63]">Role<select disabled={!editing} className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-[#173b63] outline-none transition focus:border-sky-400 focus:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-70" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option>Librarian</option><option>Administrator</option></select></label>
      <label className="md:col-span-2 flex flex-col gap-1.5 text-sm font-medium text-[#173b63]">{editing ? 'New password (optional)' : 'Password'}<input className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-[#173b63] outline-none transition focus:border-sky-400 focus:bg-[#f8fafc]" type="password" autoComplete="new-password" minLength="8" required={!editing} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder={editing ? 'Leave blank to keep current password' : 'At least 8 characters'} /></label>
      {formError && <p className="md:col-span-2 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert"><AlertCircle size={15} />{formError}</p>}
      <div className="md:col-span-2 mt-2 flex justify-end gap-2"><button type="button" className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2.5 text-sm font-semibold text-[#173b63] hover:bg-[#f8fafc]" onClick={() => setModal(false)}>Cancel</button><button className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(14,116,144,0.22)] hover:bg-sky-800"><Check size={15} />Save account</button></div>
    </form></Modal>}
    {deleting && <ConfirmDialog title="Delete staff account?" message={`Remove ${deleting.name}'s access to BOOKHUB?`} onClose={() => setDeleting(null)} onConfirm={() => { setStaff((current) => current.filter((member) => member.id !== deleting.id)); setDeleting(null); onToast('Staff account removed') }} />}
  </>
}
