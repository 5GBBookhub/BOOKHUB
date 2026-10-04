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
      <div className="page-intro"><div><p>{readOnly ? 'Browse the collection and check which titles are available.' : 'Manage titles, copies, and availability across the collection.'}</p></div>{!readOnly && <button className="button button-primary" onClick={() => setModal({ kind: 'book' })}><Plus size={16} />Add a book</button>}</div>
      <section className={`panel catalog-panel ${readOnly ? 'catalog-read-only' : ''}`}>
        <div className="toolbar"><label className="search-field"><Search size={16} /><input placeholder="Search title, author, ISBN…" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} /><kbd>⌘ K</kbd></label><label className="filter-select"><Filter size={15} /><select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1) }}><option>All categories</option>{[...new Set(books.map((book) => book.category))].sort().map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label><label className="filter-select"><select value={availability} onChange={(event) => { setAvailability(event.target.value); setPage(1) }}><option>Any availability</option><option>Available</option><option>Out of stock</option></select><ChevronDown size={14} /></label><label className="filter-select sort-filter"><SlidersHorizontal size={15} /><select value={sort} onChange={(event) => setSort(event.target.value)}><option>Recently added</option><option>Title A–Z</option><option>Most borrowed</option></select><ChevronDown size={14} /></label></div>
        <div className="catalog-grid">{visible.map((book) => <article className="catalog-card" key={book.id}><button className="cover-button" onClick={() => onOpenBook(book)}><CoverArt book={book} /></button><div className="catalog-card-body"><span className="category-label">{book.category}</span><button className="book-title-link" onClick={() => onOpenBook(book)}>{book.title}</button><p>{book.author}</p><div className="catalog-card-foot"><span className={`availability ${book.available ? '' : 'unavailable'}`}><i />{book.available ? `${book.available} of ${book.copies} available` : 'All copies borrowed'}</span><button className="icon-button small" aria-label={`Edit ${book.title}`} onClick={() => setModal({ kind: 'book', record: book })}><MoreHorizontal size={17} /></button></div><div className="card-hover-actions"><button onClick={() => setModal({ kind: 'book', record: book })}>Edit</button><button onClick={() => setDeleting(book)}>Delete</button></div></div></article>)}</div>
        {!visible.length && <div className="empty-state"><Search size={24} /><strong>No books found</strong><span>Try adjusting your search or filters.</span></div>}
        <div className="pagination"><span>Showing <strong>{filtered.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)}</strong> of <strong>{filtered.length}</strong> titles</span><div><button className="icon-button small" disabled={page === 1} aria-label="Previous page" onClick={() => setPage((current) => current - 1)}><ChevronLeft size={17} /></button><span className="page-indicator">{page} / {pages}</span><button className="icon-button small" disabled={page === pages} aria-label="Next page" onClick={() => setPage((current) => current + 1)}><ChevronRight size={17} /></button></div></div>
      </section>
      {modal && <RecordForm kind={modal.kind} record={modal.record} onSave={saveBook} onClose={() => setModal(null)} />}
      {deleting && <ConfirmDialog title="Remove this book?" message={`“${deleting.title}” will be removed from the catalog. This action cannot be undone.`} onClose={() => setDeleting(null)} onConfirm={() => { setBooks((current) => current.filter((book) => book.id !== deleting.id)); setDeleting(null); onToast('Book removed from the catalog') }} />}
    </>
  )
}
