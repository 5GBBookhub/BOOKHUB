import { useMemo, useState } from 'react'
import { Activity, AlertCircle, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Bell, BookCopy, BookOpen, Bookmark, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Download, FileBarChart2, Filter, LibraryBig, MoreHorizontal, Plus, Search, Settings, ShieldCheck, SlidersHorizontal, Sparkles, Trash2, TrendingUp, UserRound, Users, X } from 'lucide-react'
import { ActivityChart, Avatar, ConfirmDialog, CoverArt, DonutChart, IssueForm, Modal, RecordForm, StatusPill, TransactionTable } from '../components/LibraryShared.jsx'
import { daysLate, formatDate, hashPassword, money, normalizeEmail, today } from '../lib/helpers.js'

export function BooksPage({ books, setBooks, onToast, onOpenBook, initialQuery = '', readOnly = false }) {
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState('All categories')
  const [availability, setAvailability] = useState('Any availability')
  const [sort, setSort] = useState('Recently added')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const pageSize = 8
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()
    return books.filter((book) => (!search || `${book.title} ${book.author} ${book.id} ${book.isbn}`.toLowerCase().includes(search))
      && (category === 'All categories' || book.category === category)
      && (availability === 'Any availability' || (availability === 'Available' ? book.available > 0 : book.available === 0)))
      .sort((a, b) => sort === 'Title A–Z' ? a.title.localeCompare(b.title) : sort === 'Most borrowed' ? b.borrowed - a.borrowed : b.id.localeCompare(a.id))
  }, [books, query, category, availability, sort])
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)
  const saveBook = (book) => {
    setBooks((current) => modal.record ? current.map((item) => item.id === modal.record.id ? book : item) : [{ ...book, id: `BK-${Date.now().toString().slice(-4)}` }, ...current])
    setModal(null)
    onToast(modal.record ? 'Book details updated' : 'Book added to the catalog')
  }
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-[#173b63]">{readOnly ? 'Browse the collection and check which titles are available.' : 'Manage titles, copies, and availability across the collection.'}</p>
        {!readOnly && <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173b63] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173b63]" onClick={() => setModal({ kind: 'book' })}><Plus size={16} />Add a book</button>}
      </div>
      <section className="rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:p-5">
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center">
          <label className="flex w-full items-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm text-[#64748b] xl:max-w-md">
            <Search size={16} />
            <input className="w-full bg-transparent text-[#173b63] outline-none placeholder:text-[#64748b]" placeholder="Search title, author, ISBN…" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} />
            <kbd className="rounded-md border border-[#e2e8f0] bg-[#f8fafc] px-1.5 py-0.5 text-[10px] font-semibold text-[#64748b]">⌘ K</kbd>
          </label>
          <div className="flex flex-wrap gap-3 xl:ml-auto">
            <label className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm text-[#64748b]"><Filter size={15} /><select className="bg-transparent pr-5 text-[#173b63] outline-none" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1) }}><option>All categories</option>{[...new Set(books.map((book) => book.category))].sort().map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>
            <label className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm text-[#64748b]"><select className="bg-transparent pr-5 text-[#173b63] outline-none" value={availability} onChange={(event) => { setAvailability(event.target.value); setPage(1) }}><option>Any availability</option><option>Available</option><option>Out of stock</option></select><ChevronDown size={14} /></label>
            <label className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm text-[#64748b]"><SlidersHorizontal size={15} /><select className="bg-transparent pr-5 text-[#173b63] outline-none" value={sort} onChange={(event) => setSort(event.target.value)}><option>Recently added</option><option>Title A–Z</option><option>Most borrowed</option></select><ChevronDown size={14} /></label>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{visible.map((book) => <article className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc]/70 p-3 transition hover:border-[#94a3b8] hover:bg-[#f8fafc]" key={book.id}><button className="block w-full text-left" onClick={() => onOpenBook(book)}><CoverArt book={book} /></button><div className="mt-3"><span className="inline-flex rounded-full bg-[#e2e8f0] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#173b63]">{book.category}</span><button className="mt-2 block text-left text-lg font-bold text-[#173b63] transition hover:text-[#173b63]" onClick={() => onOpenBook(book)}>{book.title}</button><p className="mt-1 text-sm text-[#173b63]">{book.author}</p><div className="mt-3 flex items-center justify-between gap-2"><span className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-[10px] font-semibold ${book.available ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}><i className="h-1.5 w-1.5 rounded-full bg-current" />{book.available ? `${book.available} of ${book.copies} available` : 'All copies borrowed'}</span><button className="inline-grid h-8 w-8 place-items-center rounded-md text-[#64748b] transition hover:bg-[#e2e8f0] hover:text-[#173b63]" aria-label={`Edit ${book.title}`} onClick={() => setModal({ kind: 'book', record: book })}><MoreHorizontal size={17} /></button></div><div className="mt-3 flex items-center gap-2 border-t border-[#e2e8f0] pt-3 text-sm"><button className="font-semibold text-[#173b63] hover:text-[#173b63]" onClick={() => setModal({ kind: 'book', record: book })}>Edit</button><button className="font-semibold text-red-600 hover:text-red-700" onClick={() => setDeleting(book)}>Delete</button></div></div></article>)}</div>
        {!visible.length && <div className="mt-5 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#94a3b8] bg-[#f8fafc] px-4 py-10 text-center text-[#64748b]"><Search size={24} /><strong className="text-lg font-semibold text-[#173b63]">No books found</strong><span>Try adjusting your search or filters.</span></div>}
        <div className="mt-5 flex flex-col gap-3 border-t border-[#e2e8f0] pt-4 sm:flex-row sm:items-center sm:justify-between"><span className="text-sm text-[#173b63]">Showing <strong className="text-[#173b63]">{filtered.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)}</strong> of <strong className="text-[#173b63]">{filtered.length}</strong> titles</span><div className="flex items-center gap-2"><button className="inline-grid h-9 w-9 place-items-center rounded-md border border-[#e2e8f0] bg-[#f8fafc] text-[#64748b] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50" disabled={page === 1} aria-label="Previous page" onClick={() => setPage((current) => current - 1)}><ChevronLeft size={17} /></button><span className="text-sm font-semibold text-[#173b63]">{page} / {pages}</span><button className="inline-grid h-9 w-9 place-items-center rounded-md border border-[#e2e8f0] bg-[#f8fafc] text-[#64748b] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50" disabled={page === pages} aria-label="Next page" onClick={() => setPage((current) => current + 1)}><ChevronRight size={17} /></button></div></div>
      </section>
      {modal && <RecordForm kind={modal.kind} record={modal.record} onSave={saveBook} onClose={() => setModal(null)} />}
      {deleting && <ConfirmDialog title="Remove this book?" message={`“${deleting.title}” will be removed from the catalog. This action cannot be undone.`} onClose={() => setDeleting(null)} onConfirm={() => { setBooks((current) => current.filter((book) => book.id !== deleting.id)); setDeleting(null); onToast('Book removed from the catalog') }} />}
    </>
  )
}
