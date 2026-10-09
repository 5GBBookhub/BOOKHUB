import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Check, Mail, X } from 'lucide-react'
import { CoverArt } from '../components/LibraryShared.jsx'
import { daysLate, formatDate, today } from '../lib/helpers.js'

function Panel({ children, className = '' }) {
  return <section className={`rounded-[18px] border border-[#e3e7ed] bg-white shadow-[0_2px_5px_rgba(15,23,42,0.04)] ${className}`}>{children}</section>
}

export default function LibrarianDesk({ books, borrowers, transactions, settings, setBooks, setTransactions, onToast, onActivityNotification, onBookAvailable }) {
  const [memberQuery, setMemberQuery] = useState('')
  const [bookQuery, setBookQuery] = useState('')
  const [loanQuery, setLoanQuery] = useState('')
  const [selectedBorrower, setSelectedBorrower] = useState('')
  const [selectedBook, setSelectedBook] = useState('')
  const activeLoans = transactions.filter((item) => item.status !== 'Returned')
  const overdue = activeLoans.filter((item) => item.status === 'Overdue' || daysLate(item.due) > 0)
  const pending = transactions.filter((item) => item.status === 'Pending')
  const matchedLoans = activeLoans.filter((item) => `${item.title} ${item.borrower} ${item.borrowerId} ${item.id}`.toLowerCase().includes(loanQuery.toLowerCase()))
  const filteredBorrowers = borrowers.filter((item) => `${item.name} ${item.id} ${item.email}`.toLowerCase().includes(memberQuery.toLowerCase()))
  const filteredBooks = books.filter((item) => item.available > 0 && `${item.title} ${item.author} ${item.isbn}`.toLowerCase().includes(bookQuery.toLowerCase()))
  const dueDate = new Date(Date.now() + Number(settings.loanDays) * 86400000).toISOString().slice(0, 10)

  const checkout = () => {
    const borrower = borrowers.find((item) => item.id === selectedBorrower)
    const book = books.find((item) => item.id === selectedBook)
    if (!borrower || !book) return onToast('Select a member and an available book first.')
    const currentLoans = transactions.filter((item) => item.borrowerId === borrower.id && item.status !== 'Returned').length
    if (currentLoans >= Number(settings.maxBooks)) return onToast(`${borrower.name} has reached the ${settings.maxBooks}-book limit.`)
    const transaction = { id: `TRX-${String(Date.now()).slice(-4)}`, borrowerId: borrower.id, borrower: borrower.name, bookId: book.id, title: book.title, issued: today(), due: dueDate, status: 'Borrowed', fine: 0 }
    setTransactions((current) => [transaction, ...current])
    setBooks((current) => current.map((item) => item.id === book.id ? { ...item, available: item.available - 1, borrowed: item.borrowed + 1 } : item))
    onActivityNotification?.('borrowed', transaction)
    setSelectedBorrower('')
    setSelectedBook('')
    onToast(`Checked out ${book.title} to ${borrower.name}.`)
  }

  const checkin = (loan) => {
    const returnedTransaction = { ...loan, status: 'Returned', returned: today(), fine: daysLate(loan.due) * Number(settings.fineRate) }
    const returnedBook = books.find((book) => book.id === loan.bookId)
    setTransactions((current) => current.map((item) => item.id === loan.id ? returnedTransaction : item))
    setBooks((current) => current.map((item) => item.id === loan.bookId ? { ...item, available: Math.min(item.copies, item.available + 1) } : item))
    onActivityNotification?.('returned', returnedTransaction)
    if (returnedBook?.available === 0) onBookAvailable?.(returnedBook)
    onToast(`Checked in ${loan.title}.`)
  }

  return <div className="space-y-5">
    <div><h1 className="text-[24px] font-bold tracking-tight text-[#111827]">Librarian Desk</h1><p className="mt-1 text-sm text-[#64748b]">Circulation counter · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p></div>
    <Panel className="grid grid-cols-2 overflow-hidden md:grid-cols-5">{[['Checked out today', transactions.filter((item) => item.issued === today()).length, 'text-[#111827]'], ['Checked in today', transactions.filter((item) => item.returned === today()).length, 'text-[#111827]'], ['Fines collected', `$${transactions.filter((item) => item.returned === today()).reduce((sum, item) => sum + Number(item.fine || 0), 0).toFixed(2)}`, 'text-[#111827]'], ['Pending requests', pending.length, 'text-amber-500'], ['Overdue on loan', overdue.length, 'text-red-500']].map(([label, value, color]) => <div key={label} className="border-b border-[#e3e7ed] px-4 py-3 last:border-0 md:border-b-0 md:border-r md:last:border-r-0"><span className="block text-xs text-[#64748b]">{label}</span><strong className={`mt-1 block font-mono text-lg ${color}`}>{value}</strong></div>)}</Panel>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(280px,.85fr)]">
      <Panel className="overflow-hidden"><div className="flex items-center gap-3 border-b border-[#e3e7ed] px-5 py-4"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#173b63] text-white"><ArrowUpRight size={16} /></span><div><h2 className="text-sm font-bold text-[#111827]">Check out</h2><p className="text-xs text-[#64748b]">Lend a book to a member</p></div></div><div className="space-y-4 p-5"><label className="block text-xs font-medium text-[#64748b]">1. Member<input value={memberQuery} onChange={(event) => setMemberQuery(event.target.value)} placeholder="Name, member ID, or email" className="mt-1.5 w-full rounded-xl border border-[#e3e7ed] bg-[#f8fafc] px-3 py-2.5 text-sm outline-none focus:border-[#315c99]" /></label>{memberQuery && <div className="max-h-24 overflow-y-auto rounded-lg border border-[#e3e7ed]">{filteredBorrowers.map((item) => <button key={item.id} type="button" onClick={() => { setSelectedBorrower(item.id); setMemberQuery(item.name) }} className="block w-full px-3 py-2 text-left text-xs hover:bg-[#f1f5f9]">{item.name} <span className="text-[#94a3b8]">· {item.id}</span></button>)}</div>}<label className="block text-xs font-medium text-[#64748b]">2. Book<input value={bookQuery} onChange={(event) => setBookQuery(event.target.value)} placeholder="Title, author, or ISBN" className="mt-1.5 w-full rounded-xl border border-[#e3e7ed] bg-[#f8fafc] px-3 py-2.5 text-sm outline-none focus:border-[#315c99]" /></label>{bookQuery && <div className="max-h-24 overflow-y-auto rounded-lg border border-[#e3e7ed]">{filteredBooks.map((item) => <button key={item.id} type="button" onClick={() => { setSelectedBook(item.id); setBookQuery(item.title) }} className="block w-full px-3 py-2 text-left text-xs hover:bg-[#f1f5f9]">{item.title} <span className="text-[#94a3b8]">· {item.available} available</span></button>)}</div>}<label className="block text-xs font-medium text-[#64748b]">3. Due date<input value={formatDate(dueDate)} readOnly className="mt-1.5 w-full rounded-xl border border-[#e3e7ed] bg-[#f8fafc] px-3 py-2.5 text-sm text-[#64748b] outline-none" /></label><button type="button" onClick={checkout} className="w-full rounded-xl bg-[#173b63] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#234f80]">Check out book</button></div></Panel>
      <Panel className="overflow-hidden"><div className="flex items-center gap-3 border-b border-[#e3e7ed] px-5 py-4"><span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-600 text-white"><ArrowDownLeft size={16} /></span><div><h2 className="text-sm font-bold text-[#111827]">Check in</h2><p className="text-xs text-[#64748b]">Receive returned books</p></div></div><div className="p-5"><label className="block text-xs font-medium text-[#64748b]">Find loan<input value={loanQuery} onChange={(event) => setLoanQuery(event.target.value)} placeholder="ISBN, title, member ID, or loan ID" className="mt-1.5 w-full rounded-xl border border-[#e3e7ed] bg-[#f8fafc] px-3 py-2.5 text-sm outline-none focus:border-[#315c99]" /></label><div className="mt-4 max-h-[330px] space-y-1 overflow-y-auto">{matchedLoans.map((item) => <div key={item.id} className="flex items-center gap-3 border-b border-[#e3e7ed] py-2.5 last:border-0"><div className="h-11 w-8 shrink-0 overflow-hidden rounded-lg"><div className="h-full w-full scale-[.2] origin-top-left" style={{ width: '500%', height: '500%' }}><CoverArt book={books.find((book) => book.id === item.bookId) || { ...item, category: 'Library', author: '', tone: 'cover-new' }} /></div></div><div className="min-w-0 flex-1"><strong className="block truncate text-xs text-[#111827]">{item.title}</strong><span className="block truncate text-[10px] text-[#64748b]">{item.borrower} · {item.id}</span><span className={`text-[10px] ${daysLate(item.due) ? 'text-red-500' : 'text-[#64748b]'}`}>Due {formatDate(item.due)}{daysLate(item.due) ? ` · ${daysLate(item.due)}d late` : ''}</span></div><button type="button" onClick={() => checkin(item)} className="rounded-lg border border-[#e3e7ed] px-2.5 py-1.5 text-xs font-semibold text-[#173b63] hover:bg-[#f1f5f9]">Check in</button></div>)}</div></div></Panel>
      <div className="space-y-5"><Panel className="overflow-hidden"><div className="flex items-center justify-between border-b border-[#e3e7ed] px-5 py-4"><h2 className="text-sm font-bold text-[#111827]">Hold requests</h2><span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600">{pending.length}</span></div>{pending.length ? pending.map((item) => <div key={item.id} className="flex items-center gap-3 p-4"><div className="h-10 w-8 shrink-0 overflow-hidden rounded-lg"><div className="h-full w-full scale-[.2] origin-top-left" style={{ width: '500%', height: '500%' }}><CoverArt book={books.find((book) => book.id === item.bookId) || { ...item, category: 'Library', author: '', tone: 'cover-new' }} /></div></div><div className="min-w-0 flex-1"><strong className="block truncate text-xs">{item.title}</strong><span className="text-[10px] text-[#64748b]">{item.borrower}</span></div><button type="button" onClick={() => setTransactions((current) => current.filter((entry) => entry.id !== item.id))} aria-label="Reject hold" className="rounded-lg border p-1.5"><X size={14} /></button><button type="button" onClick={() => onToast('Hold request approved.')} aria-label="Approve hold" className="rounded-lg bg-[#173b63] p-1.5 text-white"><Check size={14} /></button></div>) : <p className="p-5 text-xs text-[#64748b]">No pending hold requests.</p>}</Panel><Panel className="overflow-hidden"><div className="border-b border-[#e3e7ed] px-5 py-4"><h2 className="text-sm font-bold text-[#111827]">Overdue ({overdue.length})</h2></div>{overdue.slice(0, 4).map((item) => <div key={item.id} className="flex items-center gap-3 border-b border-[#e3e7ed] p-4 last:border-0"><span className="grid h-10 w-10 place-items-center rounded-lg bg-red-50 text-center text-red-500"><strong className="block text-sm">{daysLate(item.due)}</strong><small className="text-[8px] uppercase">late</small></span><div className="min-w-0 flex-1"><strong className="block truncate text-xs">{item.borrower}</strong><span className="block truncate text-[10px] text-[#64748b]">{item.title} · ${Number(item.fine || daysLate(item.due) * settings.fineRate).toFixed(2)}</span></div><button type="button" onClick={() => onToast(`Reminder sent to ${item.borrower}.`)} className="inline-flex items-center gap-1 rounded-lg border border-[#e3e7ed] px-2 py-1.5 text-[10px] font-semibold"><Mail size={12} /> Remind</button></div>)}</Panel></div>
    </div>
  </div>
}
