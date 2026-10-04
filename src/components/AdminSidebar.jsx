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
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <button className="brand" onClick={() => onNavigate('dashboard', null, 'dashboard')}>
        <span className="brand-mark"><BookOpen size={21} /></span>
        <span className="brand-name">BOOK<span>HUB</span></span>
      </button>
      <nav className="main-nav" aria-label="Admin navigation">
        <span className="nav-caption">MENU</span>
        {items.map(({ label, icon: Icon, section: target }) => (
          <button key={target} className={`nav-item ${activeNavItem === target ? 'nav-active' : ''}`} onClick={() => onNavigate(target, null, target)}>
            <Icon size={18} /><span>{label}</span>
          </button>
        ))}
        <span className="nav-caption nav-caption-admin">ADMINISTRATION</span>
        <button className={`nav-item ${activeNavItem === 'staff' ? 'nav-active' : ''}`} onClick={() => onNavigate('staff', null, 'staff')}><UserRoundCog size={18} /><span>Users / Staff</span></button>
        <button className={`nav-item ${activeNavItem === 'settings' ? 'nav-active' : ''}`} onClick={() => onNavigate('settings', null, 'settings')}><Settings size={18} /><span>Settings</span></button>
      </nav>
      <div className="sidebar-bottom">
        <button className="profile-menu" onClick={onLogout} title="Sign out">
          <Avatar name={session.name} />
          <span><strong>{session.name}</strong><small>Administrator</small></span>
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}
