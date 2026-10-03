import { useMemo, useState } from 'react'
import { Activity, AlertCircle, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Bell, BookCopy, BookOpen, Bookmark, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Download, FileBarChart2, Filter, LibraryBig, MoreHorizontal, Plus, Search, Settings, ShieldCheck, SlidersHorizontal, Sparkles, Trash2, TrendingUp, UserRound, Users, X } from 'lucide-react'
import { ActivityChart, Avatar, ConfirmDialog, CoverArt, DonutChart, IssueForm, Modal, RecordForm, StatusPill, TransactionTable } from '../../Librarian/components/LibraryShared.jsx'
import { daysLate, formatDate, hashPassword, money, normalizeEmail, today } from '../../Librarian/lib/helpers.js'

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
    const email = normalizeEmail(form.email)
    if (staff.some((member) => member.id !== editing?.id && normalizeEmail(member.email) === email)) {
      setFormError('A staff account already uses this email address.')
      return
    }
    if (!editing && !form.password) {
      setFormError('Set a password before creating this account.')
      return
    }
    const credentials = form.password ? await hashPassword(form.password) : {}
    const account = {
      id: editing?.id || `ST-${String(Date.now()).slice(-4)}`,
      name: form.name.trim(), email, role: form.role, status: editing?.status || 'Active',
      ...(form.password ? credentials : { passwordHash: editing?.passwordHash, passwordSalt: editing?.passwordSalt }),
    }
    setStaff((current) => editing ? current.map((item) => item.id === editing.id ? account : item) : [account, ...current])
    setModal(false)
    onToast(editing ? 'Staff account updated' : 'Staff account created')
  }
  return <>
    <div className="page-intro"><p>Control who can access BOOKHUB and what they can manage.</p><button className="button button-primary" onClick={() => open()}><Plus size={16} />Add staff member</button></div>
    <section className="staff-intro"><div className="staff-shield"><ShieldCheck size={23} /></div><div><strong>Access is role-based</strong><span>Administrators can manage users and system settings. Librarians can manage the catalog and circulation.</span></div><span className="staff-roles">2 roles</span></section>
    <section className="panel table-panel"><div className="panel-heading staff-heading"><div><span className="eyebrow">TEAM ACCESS</span><h2>Library staff</h2></div><span className="table-count">{staff.length} accounts</span></div><div className="table-scroll"><table><thead><tr><th>Staff member</th><th>Role</th><th>Status</th><th>Account ID</th><th /></tr></thead><tbody>{staff.map((member) => <tr key={member.id}><td><div className="person-cell"><Avatar name={member.name} /><div><strong>{member.name}</strong><span>{member.email}</span></div></div></td><td><span className="role-label"><ShieldCheck size={14} />{member.role}</span></td><td><StatusPill status={member.status} /></td><td>{member.id}</td><td><div className="row-actions"><button className="icon-button small" aria-label={`Edit ${member.name}`} onClick={() => open(member)}><Settings size={15} /></button><button className="icon-button small danger-icon" aria-label={`Delete ${member.name}`} onClick={() => setDeleting(member)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div></section>
    {modal && <Modal title={`${editing ? 'Edit' : 'Add'} staff account`} subtitle="Set login credentials and assign a role." onClose={() => setModal(false)}><form className="form-grid" onSubmit={save}>
      <label className="field-span">Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Staff member name" /></label>
      <label className="field-span">Email address<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@nu.edu.ph" /></label>
      <label className="field-span">Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option>Librarian</option><option>Administrator</option></select></label>
      <label className="field-span">{editing ? 'New password (optional)' : 'Password'}<input type="password" autoComplete="new-password" minLength="8" required={!editing} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder={editing ? 'Leave blank to keep current password' : 'At least 8 characters'} /></label>
      {formError && <p className="auth-error field-span" role="alert"><AlertCircle size={15} />{formError}</p>}
      <div className="form-actions field-span"><button type="button" className="button button-quiet" onClick={() => setModal(false)}>Cancel</button><button className="button button-primary"><Check size={15} />Save account</button></div>
    </form></Modal>}
    {deleting && <ConfirmDialog title="Delete staff account?" message={`Remove ${deleting.name}'s access to BOOKHUB?`} onClose={() => setDeleting(null)} onConfirm={() => { setStaff((current) => current.filter((member) => member.id !== deleting.id)); setDeleting(null); onToast('Staff account removed') }} />}
  </>
}
