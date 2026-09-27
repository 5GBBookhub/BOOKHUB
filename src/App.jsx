import { useEffect, useState } from 'react'
import './App.css'

function Field({ label, name, type = 'text', value, onChange, error, placeholder, autoComplete, suffix }) {
  return <div className="field"><label htmlFor={name}>{label}<span aria-hidden="true"> *</span></label><div className="input-wrap"><input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined}/>{suffix}</div>{error && <small className="error" id={`${name}-error`} role="alert">{error}</small>}</div>
}

function App() {
  const [path, setPath] = useState(['/register', '/dashboard'].includes(window.location.pathname) ? window.location.pathname : '/login')
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const register = path === '/register'

  useEffect(() => {
    const pop = () => setPath(['/register', '/dashboard'].includes(window.location.pathname) ? window.location.pathname : '/login')
    window.addEventListener('popstate', pop)
    return () => window.removeEventListener('popstate', pop)
  }, [])

  const navigate = (next) => {
    window.history.pushState({}, '', next)
    setPath(next)
    setValues({})
    setErrors({})
    setSuccess(false)
    window.scrollTo(0, 0)
  }
  const update = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value })
    setErrors({ ...errors, [event.target.name]: '' })
    setSuccess(false)
  }
  const passwordToggle = () => <button className="show-password" type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? 'Hide' : 'Show'}</button>

  const submit = (event) => {
    event.preventDefault()
    const next = {}
    if (register) {
      if (!values.name?.trim()) next.name = 'Enter your full name.'
      if (!values.studentId?.trim()) next.studentId = 'Enter your student ID.'
      if (!values.email?.trim()) next.email = 'Enter your email address.'
      else if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = 'Enter a valid email address.'
      if (!values.password) next.password = 'Create a password.'
      else if (values.password.length < 8) next.password = 'Use at least 8 characters.'
      if (!values.confirmPassword) next.confirmPassword = 'Confirm your password.'
      else if (values.password !== values.confirmPassword) next.confirmPassword = 'Passwords do not match.'
      if (!accepted) next.terms = 'Please accept the terms to continue.'
    } else {
      if (!values.identity?.trim()) next.identity = 'Enter your email or student ID.'
      if (!values.password) next.password = 'Enter your password.'
    }
    setErrors(next)
    if (Object.keys(next).length) return
    if (!register) {
      navigate('/dashboard')
      return
    }
    setLoading(true)
    window.setTimeout(() => { setLoading(false); setSuccess(true) }, 600)
  }

  if (path === '/dashboard') return <main className="page"><header className="brand"><div><strong>BOOKHUB</strong><small>Library Book Borrowing &amp; Returning Management System</small></div></header><section className="auth-card dashboard-card"><div className="card-heading"><h1>Welcome to your dashboard</h1><p>Your library account is ready to connect.</p></div><p className="dashboard-note">Your user dashboard will appear here.</p><button className="submit" type="button" onClick={() => navigate('/login')}>Sign Out</button></section><footer>© {new Date().getFullYear()} BOOKHUB</footer></main>

  return <main className="page">
    <header className="brand"><div><strong>BOOKHUB</strong><small>Library Book Borrowing &amp; Returning Management System</small></div></header>
    <section className="auth-card" aria-labelledby="page-title">
      <div className="card-heading"><h1 id="page-title">{register ? 'Create your account' : 'Welcome back'}</h1><p>{register ? 'Register to borrow and manage library books online.' : 'Sign in to access your library account.'}</p></div>
      {success && <p className="success" role="status">Your account details were submitted successfully.</p>}
      <form onSubmit={submit} noValidate>
        {register ? <>
          <Field label="Full name" name="name" value={values.name || ''} onChange={update} error={errors.name} placeholder="Your full name" autoComplete="name"/>
          <Field label="Student ID" name="studentId" value={values.studentId || ''} onChange={update} error={errors.studentId} placeholder="Your student ID" autoComplete="username"/>
          <Field label="Email address" name="email" type="email" value={values.email || ''} onChange={update} error={errors.email} placeholder="you@university.edu" autoComplete="email"/>
          <Field label="Password" name="password" type={visible ? 'text' : 'password'} value={values.password || ''} onChange={update} error={errors.password} placeholder="At least 8 characters" autoComplete="new-password" suffix={passwordToggle()}/>
          <Field label="Confirm password" name="confirmPassword" type={visible ? 'text' : 'password'} value={values.confirmPassword || ''} onChange={update} error={errors.confirmPassword} placeholder="Re-enter your password" autoComplete="new-password" suffix={passwordToggle()}/>
          <label className="check-row"><input type="checkbox" checked={accepted} onChange={(e) => { setAccepted(e.target.checked); setErrors({ ...errors, terms: '' }) }}/><span>I agree to the <a href="#terms" onClick={(e) => e.preventDefault()}>Terms and Conditions</a> and <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.</span></label>
          {errors.terms && <small className="error terms-error" role="alert">{errors.terms}</small>}
        </> : <>
          <Field label="Email or student ID" name="identity" value={values.identity || ''} onChange={update} error={errors.identity} placeholder="Email or student ID" autoComplete="username"/>
          <Field label="Password" name="password" type={visible ? 'text' : 'password'} value={values.password || ''} onChange={update} error={errors.password} placeholder="Your password" autoComplete="current-password" suffix={passwordToggle()}/>
          <div className="form-options"><label className="check-row"><input type="checkbox"/><span>Remember me</span></label><a href="#forgot" onClick={(e) => e.preventDefault()}>Forgot password?</a></div>
        </>}
        <button className="submit" type="submit" disabled={loading}>{loading ? 'Please wait…' : register ? 'Create Account' : 'Sign In'}</button>
      </form>
      <p className="switch">{register ? 'Already have an account?' : "Don't have an account yet?"} <a href={register ? '/login' : '/register'} onClick={(e) => { e.preventDefault(); navigate(register ? '/login' : '/register') }}>{register ? 'Sign In' : 'Create an Account'}</a></p>
    </section>
    <footer>© {new Date().getFullYear()} BOOKHUB</footer>
  </main>
}

export default App
