import { BookCopy, BookOpen, FileBarChart2, LayoutDashboard, LogOut, Settings, UserRoundCog, Users } from 'lucide-react'
import { Avatar } from '../../Librarian/components/LibraryShared.jsx'

const items = [
  { label: 'Dashboard', icon: LayoutDashboard, section: 'dashboard' },
  { label: 'Books', icon: BookOpen, section: 'books' },
  { label: 'Borrowers', icon: Users, section: 'borrowers' },
  { label: 'Circulation', icon: BookCopy, section: 'circulation' },
  { label: 'Reports', icon: FileBarChart2, section: 'reports' },
]

export function AdminSidebar({ session, activeNavItem, onNavigate, onLogout, sidebarOpen }) {
  return (
    <aside className={`fixed inset-y-0 left-0 z-30 flex w-[246px] flex-col bg-[#111f39] p-[23px_15px_14px] text-[#e2e8f0] transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <button className="mb-4 flex items-center gap-3 rounded-xl bg-transparent p-1 text-left" onClick={() => onNavigate('dashboard', null, 'dashboard')}>
        <span className="grid h-[45px] w-[45px] place-items-center rounded-[14px] bg-[#64748b] text-white"><BookOpen size={21} /></span>
        <span className="text-[18px] font-extrabold tracking-tight text-white">BOOK<span className="text-white">HUB</span></span>
      </button>
      <nav className="flex flex-col gap-1" aria-label="Admin navigation">
        <span className="px-5 pb-2 text-[10px] font-bold uppercase tracking-[1.15px] text-[#64748b]">MENU</span>
        {items.map(({ label, icon: Icon, section: target }) => (
          <button key={target} className={`flex h-[45px] w-full items-center gap-3 rounded-[14px] px-4 text-left text-sm font-medium transition ${activeNavItem === target ? 'bg-[#64748b] text-white shadow-sm' : 'text-[#e2e8f0] hover:bg-[#f8fafc]/5 hover:text-white'}`} onClick={() => onNavigate(target, null, target)}>
            <Icon size={18} className={activeNavItem === target ? 'text-white' : 'text-[#e2e8f0]'} />
            <span>{label}</span>
          </button>
        ))}
        <span className="mt-5 px-5 pb-2 text-[10px] font-bold uppercase tracking-[1.15px] text-[#64748b]">ADMINISTRATION</span>
        <button className={`flex h-[45px] w-full items-center gap-3 rounded-[14px] px-4 text-left text-sm font-medium transition ${activeNavItem === 'staff' ? 'bg-[#64748b] text-white shadow-sm' : 'text-[#e2e8f0] hover:bg-[#f8fafc]/5 hover:text-white'}`} onClick={() => onNavigate('staff', null, 'staff')}><UserRoundCog size={18} className={activeNavItem === 'staff' ? 'text-white' : 'text-[#e2e8f0]'} /><span>Users / Staff</span></button>
        <button className={`flex h-[45px] w-full items-center gap-3 rounded-[14px] px-4 text-left text-sm font-medium transition ${activeNavItem === 'settings' ? 'bg-[#64748b] text-white shadow-sm' : 'text-[#e2e8f0] hover:bg-[#f8fafc]/5 hover:text-white'}`} onClick={() => onNavigate('settings', null, 'settings')}><Settings size={18} className={activeNavItem === 'settings' ? 'text-white' : 'text-[#e2e8f0]'} /><span>Settings</span></button>
      </nav>
      <div className="mt-auto border-t border-white/10 pt-4">
        <button className="flex w-full items-center gap-3 rounded-xl bg-transparent px-2 py-2 text-left" onClick={onLogout} title="Sign out">
          <Avatar name={session.name} />
          <span className="min-w-0 flex-1"><strong className="block truncate text-sm font-semibold text-white">{session.name}</strong><small className="mt-1 block text-xs text-[#64748b]">Administrator</small></span>
          <LogOut size={16} className="text-[#64748b]" />
        </button>
      </div>
    </aside>
  )
}
