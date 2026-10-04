import { BookOpen, LogOut, UserRound } from 'lucide-react'
import { Avatar } from '../../Librarian/components/LibraryShared.jsx'

const items = [
  { label: 'Book catalog', icon: BookOpen, section: 'books' },
  { label: 'My account', icon: UserRound, section: 'my-account' },
]

export function MemberSidebar({ session, activeNavItem, onNavigate, onLogout, sidebarOpen }) {
  return (
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <button className="brand" onClick={() => onNavigate('books', null, 'books')}>
        <span className="brand-mark"><BookOpen size={21} /></span>
        <span className="brand-name">BOOK<span>HUB</span></span>
      </button>
      <nav className="main-nav" aria-label="Member sidebar">
        <span className="nav-caption">YOUR LIBRARY</span>
        {items.map(({ label, icon: Icon, section: target }) => (
          <button key={target} className={`nav-item ${activeNavItem === target ? 'nav-active' : ''}`} onClick={() => onNavigate(target, null, target)}>
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button className="profile-menu" onClick={onLogout} title="Sign out">
          <Avatar name={session.name} />
          <span><strong>{session.name}</strong><small>{session.role === 'student' ? 'Student' : 'Employee'}</small></span>
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}
