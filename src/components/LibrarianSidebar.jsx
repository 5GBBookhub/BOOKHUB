import { BookCopy, BookOpen, Clock3, FileBarChart2, LayoutDashboard, LibraryBig, LogOut, RotateCcw, Settings, UserRoundCog, Users } from 'lucide-react'
import { Avatar } from '../../Librarian/components/LibraryShared.jsx'

const items = [
  { label: 'Dashboard', icon: LayoutDashboard, section: 'dashboard' },
  { label: 'Librarian Desk', icon: LibraryBig, section: 'dashboard' },
  { label: 'Books', icon: BookOpen, section: 'books' },
  { label: 'Borrowers', icon: Users, section: 'borrowers' },
  { label: 'Borrowing', icon: BookCopy, section: 'circulation' },
  { label: 'Returns', icon: RotateCcw, section: 'circulation' },
  { label: 'Overdue Books', icon: Clock3, section: 'circulation' },
  { label: 'Reports', icon: FileBarChart2, section: 'reports' },
]

export function LibrarianSidebar({ session, activeNavItem, overdueCount, onNavigate, onLogout, sidebarOpen }) {
  return (
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <button className="brand" onClick={() => onNavigate('dashboard', null, 'dashboard')}>
        <span className="brand-mark"><BookOpen size={21} /></span>
        <span className="brand-name">BOOK<span>HUB</span></span>
      </button>
      <nav className="main-nav" aria-label="Librarian navigation">
        <span className="nav-caption">MENU</span>
        {items.map(({ label, icon: Icon, section: target }, index) => {
          const navItem = index === 1 ? 'librarian-desk' : target
          return (
          <button key={`${target}-${label}-${index}`} className={`nav-item ${activeNavItem === navItem ? 'nav-active' : ''}`} onClick={() => onNavigate(target, null, navItem)}>
            <Icon size={18} />
            <span>{label}</span>
            {label === 'Borrowing' && overdueCount > 0 && <b className="nav-badge">{overdueCount}</b>}
          </button>
          )
        })}
        <span className="nav-caption nav-caption-admin">ADMINISTRATION</span>
        <button className={`nav-item ${activeNavItem === 'staff' ? 'nav-active' : ''}`} onClick={() => onNavigate('staff', null, 'staff')}><UserRoundCog size={18} /><span>Users / Staff</span></button>
        <button className={`nav-item ${activeNavItem === 'settings' ? 'nav-active' : ''}`} onClick={() => onNavigate('settings', null, 'settings')}><Settings size={18} /><span>Settings</span></button>
      </nav>
      <div className="sidebar-bottom">
        <button className="profile-menu" onClick={onLogout} title="Sign out">
          <Avatar name={session.name} />
          <span><strong>{session.name}</strong><small>Librarian</small></span>
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}
