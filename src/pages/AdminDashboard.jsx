import { useMemo, useState } from 'react'
import { Activity, AlertCircle, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Bell, BookCopy, BookOpen, Bookmark, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock3, Download, FileBarChart2, Filter, LibraryBig, MoreHorizontal, Plus, Search, Settings, ShieldCheck, SlidersHorizontal, Sparkles, Trash2, TrendingUp, UserRound, Users, X } from 'lucide-react'
import { ActivityChart, Avatar, ConfirmDialog, CoverArt, DonutChart, IssueForm, Modal, RecordForm, StatusPill, TransactionTable } from '../../Librarian/components/LibraryShared.jsx'
import { daysLate, formatDate, hashPassword, money, normalizeEmail, today } from '../../Librarian/lib/helpers.js'

export function Dashboard({ books, borrowers, transactions, onNavigate }) {
  const activeLoans = transactions.filter((item) => item.status !== 'Returned').length
  const overdue = transactions.filter((item) => item.status === 'Overdue' || (item.status === 'Borrowed' && daysLate(item.due) > 0)).length
  const totalCopies = books.reduce((sum, book) => sum + book.copies, 0)
  const topBooks = [...books].sort((a, b) => b.borrowed - a.borrowed).slice(0, 4)
  return (
    <>
      <div className="welcome-strip"><div><span className="eyebrow">DAILY LIBRARY SUMMARY</span><h1>Your library, in good order.</h1><p>Here’s the latest from the National University Library.</p></div><button className="button button-light" onClick={() => onNavigate('circulation')}><Plus size={16} />New loan</button><div className="welcome-mark"><LibraryBig size={74} strokeWidth={1} /></div></div>
      <section className="stats-grid">
        <StatCard label="Total book copies" value={totalCopies.toLocaleString()} change="Across the catalog" icon={BookOpen} color="blue" onClick={() => onNavigate('books')} />
        <StatCard label="Currently borrowed" value={activeLoans} change="Active loans" icon={BookCopy} color="gold" onClick={() => onNavigate('circulation')} />
        <StatCard label="Active borrowers" value={borrowers.filter((item) => item.status === 'Active').length} change="Registered members" icon={Users} color="green" onClick={() => onNavigate('borrowers')} />
        <StatCard label="Overdue items" value={overdue} change={overdue ? 'Needs attention' : 'All caught up'} icon={Clock3} color="coral" onClick={() => onNavigate('circulation')} alert={overdue > 0} />
      </section>
      <section className="dashboard-charts">
        <div className="panel activity-panel"><div className="panel-heading"><div><span className="eyebrow">LIBRARY PULSE</span><h2>Borrowing activity</h2></div><button className="select-button">Last 7 months <ChevronDown size={14} /></button></div><div className="activity-summary"><strong>1,284</strong><span>books checked out</span><span className="trend-up"><TrendingUp size={14} />12.8%</span></div><ActivityChart /></div>
        <div className="panel status-panel"><div className="panel-heading"><div><span className="eyebrow">AT A GLANCE</span><h2>Transaction status</h2></div><button className="icon-button" aria-label="Transaction status details"><MoreHorizontal size={19} /></button></div><DonutChart transactions={transactions} /><button className="panel-link" onClick={() => onNavigate('circulation')}>View all transactions <ArrowRight size={14} /></button></div>
      </section>
      <section className="dashboard-lower">
        <div className="panel recent-panel"><div className="panel-heading"><div><span className="eyebrow">THE LATEST</span><h2>Recent transactions</h2></div><button className="panel-link" onClick={() => onNavigate('circulation')}>See all <ArrowRight size={14} /></button></div><TransactionTable transactions={transactions} limit={5} /></div>
        <div className="panel popular-panel"><div className="panel-heading"><div><span className="eyebrow">READER FAVORITES</span><h2>Most borrowed</h2></div><button className="icon-button" aria-label="More most borrowed actions"><MoreHorizontal size={19} /></button></div><div className="popular-list">{topBooks.map((book, index) => <button className="popular-book" key={book.id} onClick={() => onNavigate('books', book)}><span className="rank">0{index + 1}</span><CoverArt book={book} compact /><span className="popular-copy"><strong>{book.title}</strong><span>{book.author}</span></span><span className="borrow-count">{book.borrowed}<small>loans</small></span></button>)}</div></div>
      </section>
    </>
  )
}

export function StatCard({ label, value, change, icon: Icon, color, onClick, alert }) {
  return <button className="stat-card" onClick={onClick}><span className={`stat-icon ${color}`}><Icon size={19} /></span><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className={`stat-note ${alert ? 'note-alert' : ''}`}>{alert && <AlertCircle size={13} />}{change}</span><ArrowUpRight className="stat-arrow" size={16} /></button>
}
