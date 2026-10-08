import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { StatusPill } from '../components/LibraryShared.jsx'
import { daysLate, formatDate, hashPassword, money, normalizeEmail, today } from '../lib/helpers.js'

function TransactionDistribution({ transactions }) {
  const statuses = [
    ['Borrowed', '#173b63'],
    ['Returned', '#94a3b8'],
    ['Overdue', '#d77c65'],
  ].map(([name, color]) => ({ name, color, count: transactions.filter((item) => item.status === name).length }))
  const total = statuses.reduce((sum, item) => sum + item.count, 0) || 1
  const radius = 52
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="grid items-center gap-8 md:grid-cols-[130px_minmax(180px,1fr)_190px]">
      <div className="relative mx-auto h-[112px] w-[112px]">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" role="img" aria-label="Transaction distribution chart">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="20" />
          {statuses.map((item) => {
            const length = (item.count / total) * circumference
            const segment = <circle key={item.name} cx="60" cy="60" r={radius} fill="none" stroke={item.color} strokeWidth="20" strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-offset} />
            offset += length
            return segment
          })}
        </svg>
        <div className="absolute inset-[26px] grid place-items-center rounded-full bg-[#f8fafc] text-center">
          <strong className="text-[24px] leading-none text-[#173b63]">{transactions.length}</strong>
          <span className="mt-1 text-[9px] uppercase tracking-[0.14em] text-[#64748b]">records</span>
        </div>
      </div>
      <div className="space-y-4">
        {statuses.map((item) => <div key={item.name} className="flex items-center justify-between gap-5 text-base text-[#173b63]"><span className="flex items-center gap-3"><i className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span><strong className="font-semibold">{item.count}</strong></div>)}
      </div>
      <div className="text-center md:text-left">
        <strong className="block text-[36px] font-bold leading-none tracking-tight text-[#173b63]">{transactions.length}</strong>
        <span className="mt-3 block text-lg text-[#173b63]">transactions recorded</span>
        <small className="mt-3 block text-sm leading-5 text-[#64748b]">Includes all current demo records.</small>
      </div>
    </div>
  )
}

export function ReportsPage({ books, transactions }) {
  const topBooks = [...books].sort((a, b) => b.borrowed - a.borrowed).slice(0, 6)
  const categories = [...new Set(books.map((item) => item.category))].map((name) => ({ name, count: books.filter((item) => item.category === name).length })).sort((a, b) => b.count - a.count).slice(0, 6)
  const states = ['Borrowed', 'Returned', 'Overdue'].map((name) => ({ name, count: transactions.filter((item) => item.status === name).length }))
  const max = Math.max(...topBooks.map((item) => item.borrowed), 1)
  return <>
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-[#173b63]">A clear picture of what your readers love and what needs attention.</p>
      <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2.5 text-sm font-semibold text-[#173b63] transition hover:bg-[#f8fafc]" onClick={() => window.print()}><Download size={15} />Export report</button>
    </div>
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex items-center justify-between gap-3"><div><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">COLLECTION ENGAGEMENT</span><h2 className="mt-1 text-xl font-bold text-[#173b63]">Most borrowed titles</h2></div><span className="rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">All time</span></div>
        <div className="space-y-4">{topBooks.map((book) => <div className="grid items-center gap-2 md:grid-cols-[1fr_1.6fr_auto]" key={book.id}><span className="text-sm font-medium text-[#173b63]">{book.title}</span><div className="h-2.5 overflow-hidden rounded-full bg-[#e2e8f0]"><svg className="block h-full w-full" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><rect width={(book.borrowed / max) * 100} height="10" className="fill-[#173b63]" /></svg></div><strong className="text-sm font-semibold text-[#173b63]">{book.borrowed}</strong></div>)}</div>
      </section>
      <section className="rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="mb-4"><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">COLLECTION MIX</span><h2 className="mt-1 text-xl font-bold text-[#173b63]">By category</h2></div>
        <div className="space-y-3">{categories.map((item, index) => <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 text-sm text-[#173b63]" key={item.name}><span className={`h-2.5 w-2.5 rounded-full ${index === 0 ? 'bg-[#173b63]' : index === 1 ? 'bg-[#94a3b8]' : index === 2 ? 'bg-[#d77c65]' : 'bg-[#2d5b52]'}`} /> <span>{item.name}</span><strong>{item.count}</strong><span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">{Math.round((item.count / books.length) * 100)}%</span></div>)}</div>
      </section>
      <section className="rounded-[22px] border border-[#dce4ec] bg-[#f8fafc] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:p-6">
        <div className="mb-4"><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">CIRCULATION SNAPSHOT</span><h2 className="mt-1 text-xl font-bold text-[#173b63]">Transaction distribution</h2></div>
        <TransactionDistribution transactions={transactions} />
      </section>
      <section className="rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="mb-4"><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">INVENTORY HEALTH</span><h2 className="mt-1 text-xl font-bold text-[#173b63]">Availability by copies</h2></div>
        <div className="space-y-4">
          <div><span className="text-sm text-[#173b63]">Available</span><strong className="mt-1 block text-2xl font-black text-[#173b63]">{books.reduce((sum, item) => sum + item.available, 0)} <small className="text-sm font-medium text-[#64748b]">copies</small></strong></div>
          <div className="h-2.5 overflow-hidden rounded-full bg-[#e2e8f0]"><svg className="block h-full w-full" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><rect width={Math.max(4, (books.reduce((sum, item) => sum + item.available, 0) / (books.reduce((sum, item) => sum + item.copies, 0) || 1)) * 100)} height="10" className="fill-[#173b63]" /></svg></div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#173b63]"><span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#173b63]" />Available</span><span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#94a3b8]" />Checked out</span></div>
        </div>
      </section>
    </div>
    <section className="mt-5 rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <div className="mb-4"><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">TRANSACTION STATUS</span><h2 className="mt-1 text-xl font-bold text-[#173b63]">Circulation counts</h2></div>
      <div className="grid gap-4 sm:grid-cols-3">{states.map((item) => <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4" key={item.name}><StatusPill status={item.name} /><strong className="mt-3 block text-2xl font-black text-[#173b63]">{item.count}</strong><span className="text-sm text-[#64748b]">records</span></div>)}</div>
    </section>
  </>
}
