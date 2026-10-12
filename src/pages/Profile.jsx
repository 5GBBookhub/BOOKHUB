import { useState } from 'react'
import { Check, KeyRound, ShieldCheck, UserRound } from 'lucide-react'
import { Avatar } from '../../Librarian/components/LibraryShared.jsx'

const fieldClassName = 'mt-1 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-sm text-[#173b63] outline-none transition focus:border-[#173b63] focus:bg-white focus:ring-2 focus:ring-[#173b63]/10'

export function ProfilePage({ name, id, email, role, onChangePassword }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submitPasswordChange = async (event) => {
    event.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) {
      setError('The new passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      setError('Your new password must be at least 8 characters.')
      return
    }

    setSaving(true)
    try {
      await onChangePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (passwordError) {
      setError(passwordError.message || 'We could not change your password. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <p className="mb-6 text-sm text-[#64748b]">View your account information and manage your password.</p>
      <section className="rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:p-7">
        <div className="flex flex-col gap-4 border-b border-[#e2e8f0] pb-6 sm:flex-row sm:items-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-100 text-[#64748b]"><UserRound size={24} /></span>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">Your profile</span>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-[#173b63]">{name || 'Library User'}</h2>
            <span className="mt-2 inline-flex rounded-full border border-[#e2e8f0] bg-white px-2.5 py-1 text-[10px] font-semibold capitalize text-[#64748b]">{role}</span>
          </div>
          <div className="sm:ml-auto"><Avatar name={name || 'Library User'} /></div>
        </div>
        <dl className="grid gap-4 pt-5 sm:grid-cols-2">
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-4">
            <dt className="text-xs font-medium text-[#64748b]">Full name</dt>
            <dd className="mt-1 break-words text-sm font-semibold text-[#173b63]">{name || '—'}</dd>
          </div>
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-4">
            <dt className="text-xs font-medium text-[#64748b]">User ID</dt>
            <dd className="mt-1 break-words text-sm font-semibold text-[#173b63]">{id || '—'}</dd>
          </div>
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 sm:col-span-2">
            <dt className="text-xs font-medium text-[#64748b]">Email address</dt>
            <dd className="mt-1 break-all text-sm font-semibold text-[#173b63]">{email || '—'}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-5 rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:p-7">
        <div className="mb-5 flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><KeyRound size={18} /></span>
          <div>
            <h2 className="text-lg font-bold text-[#173b63]">Change password</h2>
            <p className="mt-1 text-sm text-[#64748b]">Enter your current password and choose a new one.</p>
          </div>
        </div>
        <form className="max-w-2xl space-y-4" onSubmit={submitPasswordChange}>
          <label className="block text-sm font-medium text-[#173b63]">
            Current password
            <input className={fieldClassName} type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[#173b63]">
              New password
              <input className={fieldClassName} type="password" autoComplete="new-password" minLength="8" required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
              <span className="mt-1 block text-xs font-normal text-[#64748b]">Use at least 8 characters.</span>
            </label>
            <label className="block text-sm font-medium text-[#173b63]">
              Confirm new password
              <input className={fieldClassName} type="password" autoComplete="new-password" minLength="8" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
            </label>
          </div>
          {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{error}</p>}
          <div className="flex flex-col gap-3 border-t border-[#e2e8f0] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-xs text-[#64748b]"><ShieldCheck size={15} className="text-emerald-700" />Your password is stored securely.</p>
            <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173b63] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#102b49] disabled:cursor-wait disabled:opacity-60">
              <Check size={15} />{saving ? 'Saving…' : 'Update password'}
            </button>
          </div>
        </form>
      </section>
    </>
  )
}
