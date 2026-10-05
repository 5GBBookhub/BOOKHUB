import { useState } from 'react'
import {
  AlertCircle, ArrowRight, ArrowUpRight, BookOpen, CheckCircle2, LibraryBig,
  ShieldCheck, UserRound, Users,
} from 'lucide-react'

const roleOptions = [
  { value: 'student', label: 'Student', description: 'Browse and track loans', icon: UserRound },
  { value: 'employee', label: 'Employee', description: 'Browse and track loans', icon: Users },
]
const staffRoleOptions = [
  { value: 'admin', label: 'Admin', description: 'System administration', icon: ShieldCheck },
  { value: 'librarian', label: 'Librarian', description: 'Library operations', icon: BookOpen },
]

export default function LoginScreen({ onLogin, onCreateAccount }) {
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [course, setCourse] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState('login')
  const [staffAccessOpen, setStaffAccessOpen] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const selectedRole = [...roleOptions, ...staffRoleOptions].find((item) => item.value === role)
  const canRegister = role === 'student' || role === 'employee'
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!role) return setError('Choose an account type to continue.')
    if (mode === 'signup' && password !== confirmPassword) return setError('The passwords do not match.')
    setBusy(true)
    try {
      if (mode === 'signup') await onCreateAccount({ role, email, password, name, course })
      else await onLogin(role, email, password)
    } catch (authError) {
      setError(authError.message || 'We could not complete that request.')
    } finally {
      setBusy(false)
    }
  }
  const chooseRole = (value) => {
    setRole(value)
    setError('')
    if (value !== 'student' && value !== 'employee') setMode('login')
  }
  return (
    <main className="min-h-screen bg-[#f5f5f2] md:grid md:grid-cols-[minmax(320px,0.9fr)_minmax(490px,1.1fr)]">
      <aside className="relative flex flex-col overflow-hidden bg-[#122d4b] px-6 py-8 text-white md:px-8 xl:px-10">
        <button type="button" className="mb-12 flex items-center gap-3 self-start rounded-2xl border border-white/10 bg-[#f8fafc]/5 px-3 py-2 text-left transition hover:bg-[#f8fafc]/10" onClick={() => setRole('')}>
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#4a8fe0] text-white shadow-lg shadow-[#4a8fe0]/30"><BookOpen size={21} /></span>
          <span className="text-left font-black tracking-tight">
            <span className="block text-[1.1rem] leading-none">BOOK<span className="text-white">HUB</span></span>
            <small className="mt-1 block text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[#e2e8f0]">NU LIBRARY SYSTEM</small>
          </span>
        </button>

        <div className="relative z-10 mt-6 flex-1">
          <span className="mb-5 block text-[0.68rem] font-semibold uppercase tracking-[0.35em] text-[#e2e8f0]/80">National University · Library</span>
          <h1 className="max-w-sm text-4xl font-bold tracking-tight text-white md:text-5xl">A good place to begin.</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#e2e8f0]/90">One thoughtful space for the books, people, and ideas that make our campus.</p>
          <div className="mt-8 flex items-center gap-3">
            <span className="h-1.5 w-12 rounded-full bg-[#94a3b8]" />
            <span className="h-1.5 w-7 rounded-full bg-[#f8fafc]/35" />
            <span className="h-1.5 w-7 rounded-full bg-[#f8fafc]/20" />
          </div>
        </div>

        <div className="relative z-10 mt-12 flex items-center justify-center">
          <div className="relative flex h-[220px] w-[220px] items-center justify-center">
            <LibraryBig size={180} strokeWidth={0.7} className="text-[#e2e8f0]/80" />
            <span className="absolute inset-5 rounded-full border border-white/15" />
            <span className="absolute inset-10 rounded-full border border-[#94a3b8]/60" />
            <span className="absolute bottom-11 left-1/2 h-0.5 w-24 -translate-x-1/2 bg-[#94a3b8]" />
          </div>
        </div>

        <span className="relative z-10 mt-10 text-center text-[0.62rem] font-semibold uppercase tracking-[0.35em] text-[#e2e8f0]">Knowledge in motion · est. 1900</span>
      </aside>

      <section className="flex items-center justify-center bg-[#f8fafc] px-5 py-8 sm:px-8 lg:px-10">
        <div className="w-full max-w-xl rounded-[30px] border border-[#e2e8f0] bg-[#f8fafc]/90 p-5 shadow-[0_18px_55px_rgba(25,44,62,0.08)] backdrop-blur-sm sm:p-7">
          <span className="mb-4 block text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#173b63]">BOOKHUB ACCOUNT</span>
          <h2 className="text-3xl font-bold tracking-tight text-[#173b63]">{mode === 'signup' ? 'Create your account.' : 'Welcome back.'}</h2>
          <p className="mt-2 text-sm leading-6 text-[#64748b]">{mode === 'signup' ? 'Join the library as a student or employee.' : 'Sign in or create an account to explore the library.'}</p>

          <div className="mt-6 grid gap-3" role="group" aria-label="Choose account type">
            {[...roleOptions, ...(staffAccessOpen ? staffRoleOptions : [])].map(({ value, label, description, icon: Icon }) => (
              <button
                key={value}
                type="button"
                className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${role === value ? 'border-[#173b63] bg-[#e2e8f0] shadow-sm' : 'border-[#e2e8f0] bg-[#f8fafc] hover:border-[#e2e8f0] hover:bg-[#f8fafc]'}`}
                aria-pressed={role === value}
                onClick={() => chooseRole(value)}
              >
                <span className={`grid h-9 w-9 place-items-center rounded-xl ${role === value ? 'bg-[#173b63] text-white' : 'bg-[#e2e8f0] text-[#173b63]'}`}>
                  <Icon size={17} />
                </span>
                <span className="flex-1 min-w-0">
                  <strong className="block text-sm font-semibold text-[#173b63]">{label}</strong>
                  <small className="mt-0.5 block text-xs text-[#64748b]">{description}</small>
                </span>
                {role === value && <CheckCircle2 className="text-[#173b63]" size={16} />}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="mt-4 text-xs font-medium text-[#64748b] underline decoration-[#64748b] underline-offset-4 transition hover:text-[#173b63] focus:outline-none focus:ring-2 focus:ring-[#e2e8f0] focus:ring-offset-2"
            aria-expanded={staffAccessOpen}
            onClick={() => {
              const nextOpen = !staffAccessOpen
              setStaffAccessOpen(nextOpen)
              if (!nextOpen && (role === 'admin' || role === 'librarian')) setRole('')
              if (nextOpen) setMode('login')
              setError('')
            }}
          >
            {staffAccessOpen ? 'Hide staff sign in' : 'Log in as Staff'}
          </button>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            {mode === 'signup' && (
              <>
                <label className="block text-sm font-medium text-[#173b63]">
                  Full name
                  <input autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" className="mt-1.5 block w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#173b63] placeholder:text-[#64748b] focus:border-[#173b63] focus:outline-none focus:ring-2 focus:ring-[#e2e8f0]" />
                </label>
                <label className="block text-sm font-medium text-[#173b63]">
                  {role === 'student' ? 'Course / program' : 'Department'}
                  <input required value={course} onChange={(event) => setCourse(event.target.value)} placeholder={role === 'student' ? 'e.g. BS Information Technology' : 'e.g. Faculty of Computing'} className="mt-1.5 block w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#173b63] placeholder:text-[#64748b] focus:border-[#173b63] focus:outline-none focus:ring-2 focus:ring-[#e2e8f0]" />
                </label>
              </>
            )}

            <label className="block text-sm font-medium text-[#173b63]">
              Email address
              <input type="email" autoComplete="username" required placeholder="name@nu.edu.ph" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 block w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#173b63] placeholder:text-[#64748b] focus:border-[#173b63] focus:outline-none focus:ring-2 focus:ring-[#e2e8f0]" />
            </label>

            <label className="block text-sm font-medium text-[#173b63]">
              Password
              <span className="mt-1.5 flex items-center rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 focus-within:border-[#173b63] focus-within:ring-2 focus-within:ring-[#e2e8f0]">
                <input type={showPassword ? 'text' : 'password'} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={8} required placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full border-0 bg-transparent py-2.5 text-sm text-[#173b63] placeholder:text-[#64748b] focus:outline-none" />
                <button type="button" className="ml-2 text-xs font-medium text-[#173b63] transition hover:text-[#173b63]" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Hide' : 'Show'}</button>
              </span>
            </label>

            {mode === 'signup' && (
              <label className="block text-sm font-medium text-[#173b63]">
                Confirm password
                <input type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} required placeholder="Enter password again" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 block w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#173b63] placeholder:text-[#64748b] focus:border-[#173b63] focus:outline-none focus:ring-2 focus:ring-[#e2e8f0]" />
              </label>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between gap-3 text-xs text-[#64748b]">
                <label className="inline-flex items-center gap-2 font-medium text-[#173b63]">
                  <input type="checkbox" className="h-4 w-4 rounded border-[#94a3b8] text-[#173b63] focus:ring-[#173b63]" />
                  Keep me signed in
                </label>
                <button type="button" className="font-medium text-[#173b63] hover:text-[#173b63]" onClick={() => setError('Please contact the library administrator to reset your password.')}>Forgot password?</button>
              </div>
            )}

            {error && (
              <p className="flex items-center gap-2 rounded-xl border border-[#f1d7d3] bg-[#fff5f4] px-3 py-2 text-sm text-[#9a4c43]" role="alert">
                <AlertCircle size={15} />
                {error}
              </p>
            )}

            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#173b63] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(23,59,99,0.25)] transition hover:bg-[#173b63] disabled:cursor-not-allowed disabled:opacity-60" disabled={!selectedRole || busy}>
              <span>{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : `Sign in as ${selectedRole?.label || '…'}`}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {canRegister && (
            <p className="mt-5 text-center text-sm text-[#64748b]">
              {mode === 'signup' ? 'Already have an account?' : 'New to BOOKHUB?'}{' '}
              <button type="button" className="font-semibold text-[#173b63] hover:text-[#173b63]" onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError('') }}>
                {mode === 'signup' ? 'Sign in' : 'Create an account'}
              </button>
            </p>
          )}

          <p className="mt-5 flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8faf9] px-3 py-2 text-xs text-[#64748b]">
            <ShieldCheck size={14} className="text-[#173b63]" />
            Demo accounts are stored in this browser. Connect a trusted auth service before using real credentials.
          </p>

          <div className="mt-5 flex items-center justify-between border-t border-[#e2e8f0] pt-4 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-[#64748b]">
            <span>© 2026 National University</span>
            <span className="inline-flex items-center gap-1">Help desk <ArrowUpRight size={12} /></span>
          </div>
        </div>
      </section>
    </main>
  )
}
