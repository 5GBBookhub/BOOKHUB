import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookCopy,
  BookOpen,
  Bookmark,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  FileBarChart2,
  Filter,
  LibraryBig,
  MoreHorizontal,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  TrendingUp,
  UserRound,
  Users,
  X,
} from "lucide-react";
import {
  ActivityChart,
  Avatar,
  ConfirmDialog,
  CoverArt,
  DonutChart,
  Modal,
  RecordForm,
  StatusPill,
  TransactionTable,
} from "../components/LibraryShared.jsx";
import {
  daysLate,
  formatDate,
  hashPassword,
  money,
  normalizeEmail,
  today,
} from "../lib/helpers.js";

export function CirculationPage({
  books,
  setBooks,
  borrowers,
  transactions,
  setTransactions,
  settings,
  onToast,
  onActivityNotification,
  onBookAvailable,
  initialTab = "All transactions",
}) {
  const [tab, setTab] = useState(initialTab);
  const [query, setQuery] = useState("");
  const [returning, setReturning] = useState(null);
  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);
  const loanRows = transactions.filter((item) => ["Pending", "Borrowed", "Overdue"].includes(item.status));
  const overdueRows = loanRows.filter(
    (item) => item.status === "Overdue" || daysLate(item.due) > 0,
  );
  const source =
    tab === "Overdue"
      ? overdueRows
      : tab === "Returns"
        ? transactions.filter((item) => item.status === "Returned")
        : transactions;
  const filtered = source.filter((item) =>
    `${item.borrower} ${item.title} ${item.id}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const completeReturn = (transaction) => {
    const late = daysLate(transaction.due);
    const fine = late * Number(settings.fineRate);
    const returnedTransaction = {
      ...transaction,
      status: "Returned",
      returned: today(),
      fine,
    };
    const returnedBook = books.find((book) => book.id === transaction.bookId);
    setTransactions((current) =>
      current.map((item) =>
        item.id === transaction.id ? returnedTransaction : item,
      ),
    );
    setBooks((current) =>
      current.map((item) =>
        item.id === transaction.bookId
          ? { ...item, available: Math.min(item.copies, item.available + 1) }
          : item,
      ),
    );
    onActivityNotification?.("returned", returnedTransaction);
    if (returnedBook?.available === 0) onBookAvailable?.(returnedBook);
    setReturning(null);
    onToast(
      late
        ? `Return recorded - ${money(fine)} fine due`
        : "Return recorded successfully",
    );
  };
  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-[#173b63]">
          Record borrowed books, process returns, and follow up on overdue
          books.
        </p>
      </div>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[20px] border border-[#e2e8f0] bg-[#f8fafc] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-sky-100 text-[#64748b]">
              <BookCopy size={18} />
            </span>
            <div>
              <span className="text-sm text-[#64748b]">Borrowed</span>
              <strong className="mt-1 block text-2xl font-black text-[#173b63]">
                {loanRows.length}
              </strong>
            </div>
          </div>
        </div>
        <div className="rounded-[20px] border border-[#e2e8f0] bg-[#f8fafc] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-rose-100 text-rose-700">
              <Clock3 size={18} />
            </span>
            <div>
              <span className="text-sm text-[#64748b]">Overdue</span>
              <strong className="mt-1 block text-2xl font-black text-[#173b63]">
                {overdueRows.length}
              </strong>
            </div>
          </div>
        </div>
        <div className="rounded-[20px] border border-[#e2e8f0] bg-[#f8fafc] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={18} />
            </span>
            <div>
              <span className="text-sm text-[#64748b]">Returned</span>
              <strong className="mt-1 block text-2xl font-black text-[#173b63]">
                {
                  transactions.filter((item) => item.status === "Returned")
                    .length
                }
              </strong>
            </div>
          </div>
        </div>
      </section>
      <section className="mt-5 rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex flex-wrap gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-1">
            <div className="flex items-center gap-2">
              {["All transactions", "Returns", "Overdue"].map((item) => (
                <button
                  className={
                    tab === item
                      ? "rounded-lg bg-[#f8fafc] px-3 py-1.5 text-sm font-semibold text-[#64748b] shadow-sm ring-1 ring-[#64748b]"
                      : "rounded-lg px-3 py-1.5 text-sm text-[#64748b] transition hover:text-[#173b63]"
                  }
                  key={item}
                  onClick={() => setTab(item)}
                >
                  {item}
                  {item === "Overdue" && overdueRows.length > 0 && (
                    <span className="ml-2 rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700">
                      {overdueRows.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm text-[#64748b] focus-within:border-sky-400 focus-within:bg-[#f8fafc]">
            <Search size={16} />
            <input
              className="w-full bg-transparent text-[#173b63] outline-none placeholder:text-[#64748b]"
              placeholder="Search transactions..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>
        {tab === "Overdue" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[#e2e8f0] text-[#64748b]">
                <tr>
                  <th className="py-3 pr-4 font-medium">Borrower</th>
                  <th className="py-3 pr-4 font-medium">Book title</th>
                  <th className="py-3 pr-4 font-medium">Due date</th>
                  <th className="py-3 pr-4 font-medium">Days late</th>
                  <th className="py-3 pr-4 font-medium">Fine due</th>
                  <th className="py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const late = daysLate(item.due);
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-[#e2e8f0] last:border-b-0"
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={item.borrower} />
                          <div className="flex flex-col">
                            <strong className="font-semibold text-[#173b63]">
                              {item.borrower}
                            </strong>
                            <span className="text-xs text-[#64748b]">
                              {item.borrowerId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-[#173b63]">{item.title}</td>
                      <td className="py-3 pr-4 text-[#173b63]">
                        {formatDate(item.due)}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                          {late} days
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-[#173b63]">
                        {money(late * Number(settings.fineRate))}
                      </td>
                      <td className="py-3">
                        <button
                          className="text-sm font-semibold text-[#64748b] hover:text-sky-800"
                          onClick={() => setReturning(item)}
                        >
                          Record return
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!filtered.length && (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-[#64748b]">
                      Nothing overdue. A lovely sight.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <TransactionTable
            transactions={filtered}
            onReturn={tab === "All transactions" ? setReturning : null}
          />
        )}
      </section>
      {returning && (
        <Modal
          title="Record this return?"
          subtitle="The book will be added back to available inventory."
          onClose={() => setReturning(null)}
        >
          <div className="flex items-center gap-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
            <BookOpen size={19} className="text-[#64748b]" />
            <div className="flex flex-col">
              <strong className="font-semibold text-[#173b63]">
                {returning.title}
              </strong>
              <span className="text-sm text-[#64748b]">
                {returning.borrower} - Due {formatDate(returning.due)}
              </span>
            </div>
          </div>
          {daysLate(returning.due) > 0 && (
            <p className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <AlertCircle size={15} />
              {daysLate(returning.due)} days late -{" "}
              {money(daysLate(returning.due) * Number(settings.fineRate))} fine
            </p>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <button
              className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2.5 text-sm font-semibold text-[#173b63] hover:bg-[#f8fafc]"
              onClick={() => setReturning(null)}
            >
              Cancel
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(14,116,144,0.22)] hover:bg-sky-800"
              onClick={() => completeReturn(returning)}
            >
              <Check size={15} />
              Confirm return
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
