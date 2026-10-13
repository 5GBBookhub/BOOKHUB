import { useState } from 'react'
import { createPortal } from 'react-dom'
import { BookOpen, Clock3, Gauge, History, LogOut } from 'lucide-react'
import { Avatar, Modal } from '../../Librarian/components/LibraryShared.jsx'

const items = [
  { label: 'Dashboard', icon: Gauge, section: 'dashboard' },
  { label: 'Books', icon: BookOpen, section: 'books' },
  { label: 'History', icon: History, section: 'history' },
]

export function MemberSidebar({ session, activeNavItem, onNavigate, onLogout, sidebarOpen }) {
  const [isConfirming, setIsConfirming] = useState(false)

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 flex w-[246px] flex-col bg-[#111f39] p-[23px_15px_14px] text-[#e2e8f0] transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <button className="mb-4 flex items-center gap-3 rounded-xl bg-transparent p-1 text-left" onClick={() => onNavigate('dashboard', null, 'dashboard')}>
        <span className="grid h-[45px] w-[45px] place-items-center rounded-[14px] bg-[#64748b] text-white"><BookOpen size={21} /></span>
        <span className="text-[18px] font-extrabold tracking-tight text-white">BOOK<span className="text-white">HUB</span></span>
      </button>
      <nav className="flex flex-col gap-1" aria-label="Member sidebar">
        <span className="px-5 pb-2 text-[10px] font-bold uppercase tracking-[1.15px] text-[#64748b]">MENU</span>
        {items.map(({ label, icon: Icon, section: target }) => (
          <button key={target} className={`flex h-[45px] w-full items-center gap-3 rounded-[14px] px-4 text-left text-sm font-medium transition ${activeNavItem === target ? 'bg-[#64748b] text-white shadow-sm' : 'text-[#e2e8f0] hover:bg-[#f8fafc]/5 hover:text-white'}`} onClick={() => onNavigate(target, null, target)}>
            <Icon size={18} className={activeNavItem === target ? 'text-white' : 'text-[#e2e8f0]'} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto border-t border-white/10 pt-4">
        <button className="flex w-full items-center gap-3 rounded-xl bg-transparent px-2 py-2 text-left transition hover:bg-white/5" onClick={() => setIsConfirming(true)} title="Sign out">
          <Avatar name={session.name} />
          <span className="min-w-0 flex-1"><strong className="block truncate text-sm font-semibold text-white">{session.name}</strong><small className="mt-1 block text-xs text-[#64748b]">{session.role === 'student' ? 'Student' : 'Employee'}</small></span>
          <LogOut size={16} className="text-[#64748b]" />
        </button>
      </div>
      {isConfirming && (
        createPortal(
          <Modal title="Sign out" onClose={() => setIsConfirming(false)}>
            <p className="mt-1 text-sm leading-6 text-[#173b63]">Are you sure you want to sign out of BOOKHUB?</p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button className="inline-flex items-center justify-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2 text-sm font-semibold text-[#173b63] transition hover:border-[#94a3b8] hover:bg-white" onClick={() => setIsConfirming(false)}>Cancel</button>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#bd5a4e] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a94a3f]" onClick={onLogout}><LogOut size={15} />Sign out</button>
            </div>
          </Modal>,
          document.body,
        )
      )}
    </aside>
  )
}
