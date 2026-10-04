import { useMemo, useState } from 'react'
import { Activity, AlertCircle, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Bell, BookCopy, BookOpen, Bookmark, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock3, Download, FileBarChart2, Filter, LibraryBig, MoreHorizontal, Plus, Search, Settings, ShieldCheck, SlidersHorizontal, Sparkles, Trash2, TrendingUp, UserRound, Users, X } from 'lucide-react'
import { ActivityChart, Avatar, ConfirmDialog, CoverArt, DonutChart, IssueForm, Modal, RecordForm, StatusPill, TransactionTable } from '../components/LibraryShared.jsx'
import { daysLate, formatDate, hashPassword, money, normalizeEmail, today } from '../lib/helpers.js'

export function CirculationPage({ books, setBooks, borrowers, transactions, setTransactions, settings, onToast, initialTab = 'All transactions' }) {
  const [tab, setTab] = useState(initialTab)
  const [query, setQuery] = useState('')
  const [issuing, setIssuing] = useState(false)
  const [returning, setReturning] = useState(null)
  const loanRows = transactions.filter((item) => item.status !== 'Returned')
  const overdueRows = loanRows.filter((item) => item.status === 'Overdue' || daysLate(item.due) > 0)
  const source = tab === 'Overdue' ? overdueRows : tab === 'Returns' ? transactions.filter((item) => item.status === 'Returned') : transactions
  const filtered = source.filter((item) => `${item.borrower} ${item.title} ${item.id}`.toLowerCase().includes(query.toLowerCase()))
  const issue = (borrowerId, bookId) => {
    const borrower = borrowers.find((item) => item.id === borrowerId)
    const book = books.find((item) => item.id === bookId)
    const currentLoans = transactions.filter((item) => item.borrowerId === borrowerId && item.status !== 'Returned').length
    if (currentLoans >= Number(settings.maxBooks)) {
      onToast(`${borrower.name} has reached the ${settings.maxBooks}-book limit`)
      return
    }
    if (!book || book.available < 1) {
      onToast('That title is no longer available')
      return
    }
    const due = new Date(Date.now() + Number(settings.loanDays) * 86400000).toISOString().slice(0, 10)
    const transaction = { id: `TRX-${String(Date.now()).slice(-4)}`, borrowerId, borrower: borrower.name, bookId, title: book.title, issued: today(), due, status: 'Borrowed', fine: 0 }
    setTransactions((current) => [transaction, ...current])
    setBooks((current) => current.map((item) => item.id === bookId ? { ...item, available: item.available - 1, borrowed: item.borrowed + 1 } : item))
    setIssuing(false)
    onToast(`Loan created for ${borrower.name}`)
  }
  const completeReturn = (transaction) => {
    const late = daysLate(transaction.due)
    const fine = late * Number(settings.fineRate)
    setTransactions((current) => current.map((item) => item.id === transaction.id ? { ...item, status: 'Returned', returned: today(), fine } : item))
    setBooks((current) => current.map((item) => item.id === transaction.bookId ? { ...item, available: Math.min(item.copies, item.available + 1) } : item))
    setReturning(null)
    onToast(late ? `Return recorded · ${money(fine)} fine due` : 'Return recorded successfully')
  }
  return <><div className="page-intro"><p>Issue loans, process returns, and follow up on overdue books.</p><button className="button button-primary" onClick={() => setIssuing(true)}><Plus size={16} />Issue a book</button></div><section className="circulation-summary"><div className="mini-summary"><span className="stat-icon blue"><BookCopy size={18} /></span><div><span>On loan</span><strong>{loanRows.length}</strong></div></div><div className="mini-summary"><span className="stat-icon coral"><Clock3 size={18} /></span><div><span>Overdue</span><strong>{overdueRows.length}</strong></div></div><div className="mini-summary"><span className="stat-icon green"><CheckCircle2 size={18} /></span><div><span>Returned</span><strong>{transactions.filter((item) => item.status === 'Returned').length}</strong></div></div></section><section className="panel table-panel"><div className="circulation-toolbar"><div className="segmented-control">{['All transactions', 'Returns', 'Overdue'].map((item) => <button className={tab === item ? 'selected' : ''} key={item} onClick={() => setTab(item)}>{item}{item === 'Overdue' && overdueRows.length > 0 && <span className="tab-count">{overdueRows.length}</span>}</button>)}</div><label className="search-field circulation-search"><Search size={16} /><input placeholder="Search transactions…" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>{tab === 'Overdue' ? <div className="table-scroll"><table><thead><tr><th>Borrower</th><th>Book title</th><th>Due date</th><th>Days late</th><th>Fine due</th><th /></tr></thead><tbody>{filtered.map((item) => { const late = daysLate(item.due); return <tr key={item.id}><td><div className="person-cell"><Avatar name={item.borrower} /><div><strong>{item.borrower}</strong><span>{item.borrowerId}</span></div></div></td><td>{item.title}</td><td>{formatDate(item.due)}</td><td><span className="late-count">{late} days</span></td><td><strong>{money(late * Number(settings.fineRate))}</strong></td><td><button className="text-action" onClick={() => setReturning(item)}>Record return</button></td></tr>})}{!filtered.length && <tr><td colSpan="6" className="empty-cell">Nothing overdue. A lovely sight.</td></tr>}</tbody></table></div> : <TransactionTable transactions={filtered} onReturn={tab === 'All transactions' ? setReturning : null} />}</section>{issuing && <IssueForm borrowers={borrowers} books={books} onSave={issue} onClose={() => setIssuing(false)} />}{returning && <Modal title="Record this return?" subtitle="The book will be added back to available inventory." onClose={() => setReturning(null)}><div className="return-summary"><BookOpen size={19} /><div><strong>{returning.title}</strong><span>{returning.borrower} · Due {formatDate(returning.due)}</span></div></div>{daysLate(returning.due) > 0 && <p className="fine-note"><AlertCircle size={15} />{daysLate(returning.due)} days late · {money(daysLate(returning.due) * Number(settings.fineRate))} fine</p>}<div className="form-actions"><button className="button button-quiet" onClick={() => setReturning(null)}>Cancel</button><button className="button button-primary" onClick={() => completeReturn(returning)}><Check size={15} />Confirm return</button></div></Modal>}</>
}
