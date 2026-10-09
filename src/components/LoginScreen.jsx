import { useState } from 'react'
import { ArrowRight, BookOpen } from 'lucide-react'

const detectRole = (email) => {
  const normalized = email.trim().toLowerCase()

  if (!normalized) return 'student'
  if (normalized === 'admin@lrc.ph') return 'admin'
  if (normalized.includes('@lrc.ph')) return 'librarian'
  return 'student'
}

export default function LoginScreen({ onLogin, onCreateAccount }) {
  const [email, setEmail] = useState('admin@lrc.ph')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [course, setCourse] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')

    if (!email.trim()) return setError('Please provide your email address.')
    if (!password.trim()) return setError('Please provide your password.')

    if (mode === 'signup' && (!name.trim() || !course.trim())) {
      return setError('Please complete your full name and course information.')
    }

    setBusy(true)
    try {
      const resolvedRole = mode === 'signup' ? 'student' : detectRole(email)
      if (mode === 'signup') {
        await onCreateAccount({ role: resolvedRole, email, password, name, course })
      } else {
        await onLogin(resolvedRole, email, password)
      }
    } catch (authError) {
      setError(authError.message || 'We could not complete that request.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#efe9e1] text-[#2f261f]">
      <header className="flex items-center justify-between px-7 py-5 md:px-10 xl:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5d4033] text-white shadow-inner shadow-white/10">
            <BookOpen size={18} />
          </div>
          <div className="leading-none">
            <div className="font-black tracking-[0.08em] text-[#2f261f]">BOOKHUB</div>
            <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.26em] text-[#2f261f]/80">Library System</div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] items-center gap-8 px-7 pb-10 pt-5 md:grid-cols-[1.05fr_0.95fr] md:px-10 xl:px-16 xl:pb-14">
        <section className="flex min-h-[540px] flex-col justify-center px-2 py-6 md:px-4">
          <div className="mb-6 text-[10px] font-medium uppercase tracking-[0.55em] text-[#2f261f]/60">
            A little inspiration for your next chapter
          </div>

          <h1 className="font-serif text-[4.2rem] leading-[0.8] tracking-[-0.08em] text-[#2f261f] md:text-[6.7rem]">
            BORROW
            <span className="block">READ</span>
            <span className="block">RETURN</span>
          </h1>

          <p className="mt-8 max-w-[420px] text-[1.05rem] leading-relaxed text-[#2f261f]/70">
            One thoughtful space for the books, people, and ideas that make our campus.
          </p>

          <div className="mt-8 flex justify-center md:justify-start">
            <img
              src="/books-removebg-preview.png"
              alt="Stack of books illustration"
              className="h-[250px] w-auto max-w-[460px] object-contain opacity-90 md:h-[220px]"
            />
          </div>

          <div className="mt-8 text-[10px] font-medium uppercase tracking-[0.5em] text-[#2f261f]/60">
            Knowledge in motion · est. 2026
          </div>
        </section>

        <section className="flex justify-center py-4 md:py-0">
          <div className="w-full max-w-[500px] rounded-[28px] bg-[#f7f3ee]/90 p-5 shadow-[0_22px_55px_rgba(71,49,38,0.07)] ring-1 ring-[#d8cdc3] backdrop-blur-sm sm:p-7">
            <div className="mb-5 text-[10px] font-medium uppercase tracking-[0.42em] text-[#2f261f]/60">
              BookHub account
            </div>

            <h2 className="text-[2.2rem] font-bold leading-none tracking-[-0.05em] text-[#2f261f]">
              {mode === 'signup' ? 'Create your account.' : 'Welcome back.'}
            </h2>

            <p className="mt-3 text-[1.03rem] leading-relaxed text-[#2f261f]/65">
              Sign in or create an account to explore the library.
            </p>

            <form className="mt-7 space-y-4" onSubmit={submit}>
              {mode === 'signup' && (
                <>
                  <label className="block text-[0.85rem] font-medium text-[#2f261f]/75">
                    Full name
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Your full name"
                      className="mt-2 block w-full rounded-xl border border-[#d5d0ca] bg-[#f7f3ee] px-3.5 py-3 text-[0.96rem] text-[#2f261f] outline-none transition placeholder:text-[#2f261f]/40 focus:border-[#987255] focus:bg-[#fffaf5]"
                    />
                  </label>

                  <label className="block text-[0.85rem] font-medium text-[#2f261f]/75">
                    Course / program
                    <input
                      value={course}
                      onChange={(event) => setCourse(event.target.value)}
                      placeholder="BS Information Technology"
                      className="mt-2 block w-full rounded-xl border border-[#d5d0ca] bg-[#f7f3ee] px-3.5 py-3 text-[0.96rem] text-[#2f261f] outline-none transition placeholder:text-[#2f261f]/40 focus:border-[#987255] focus:bg-[#fffaf5]"
                    />
                  </label>
                </>
              )}

              <label className="block text-[0.85rem] font-medium text-[#2f261f]/75">
                Email address
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@lrc.ph"
                  className="mt-2 block w-full rounded-xl border border-[#d5d0ca] bg-[#f7f3ee] px-3.5 py-3 text-[0.96rem] text-[#2f261f] outline-none transition placeholder:text-[#2f261f]/40 focus:border-[#987255] focus:bg-[#fffaf5]"
                />
              </label>

              <label className="block text-[0.85rem] font-medium text-[#2f261f]/75">
                Password
                <div className="relative mt-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-xl border border-[#d5d0ca] bg-[#f7f3ee] px-3.5 py-3 pr-12 text-[0.96rem] text-[#2f261f] outline-none transition placeholder:text-[#2f261f]/40 focus:border-[#987255] focus:bg-[#fffaf5]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.75rem] font-medium text-[#2f261f]/70 transition hover:text-[#2f261f]"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              {mode === 'login' && (
                <div className="flex items-center justify-between gap-3 pt-1 text-[0.72rem] text-[#2f261f]/70">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" className="h-3.5 w-3.5 rounded border-[#b9b1a8] accent-[#5d4033]" />
                    Keep me signed in
                  </label>
                  <button type="button" className="font-medium text-[#2f261f]/70 hover:text-[#2f261f]">
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-[#e8cbc3] bg-[#faf0ee] px-3 py-2 text-[0.76rem] text-[#8b453d]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5d4033] px-4 py-3 text-[0.95rem] font-semibold text-[#f6f0eb] shadow-[0_10px_16px_rgba(93,64,51,0.2)] transition hover:bg-[#4a342b] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy ? 'Signing in…' : mode === 'signup' ? 'Create account' : 'Sign in'}
                <ArrowRight size={16} />
              </button>

              {mode === 'login' ? (
                <button type="button" onClick={() => setMode('signup')} className="mt-1 block w-full text-center text-[0.76rem] text-[#2f261f]/60 hover:text-[#2f261f]">
                  Need an account? Create one
                </button>
              ) : (
                <button type="button" onClick={() => setMode('login')} className="mt-1 block w-full text-center text-[0.76rem] text-[#2f261f]/60 hover:text-[#2f261f]">
                  Back to sign in
                </button>
              )}
            </form>

            <div className="mt-8 flex items-center justify-between border-t border-[#d8cdc3] pt-4 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-[#2f261f]/60">
              <span>© 2026 BookHub</span>
              <span className="inline-flex items-center gap-2">
                HELP DESK
                <ArrowRight size={12} />
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
