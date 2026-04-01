import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/',            icon: '🏠', label: 'Главная',        adminOnly: false },
  { to: '/profile',     icon: '👤', label: 'Профиль',        adminOnly: false },
  { to: '/journal/new', icon: '📝', label: 'Создать журнал', adminOnly: true  },
  { to: '/admin',       icon: '⚙️', label: 'Управление',     adminOnly: true  },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name
    ? user.name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const visibleLinks = NAV_LINKS.filter(l => !l.adminOnly || user?.isAdmin);

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar__brand" style={{ textDecoration: 'none' }}>
        Э<span style={{ color: 'var(--accent)' }}>·</span>Журнал
      </NavLink>

      <div className="navbar__links">
        {visibleLinks.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) => 'navbar__link' + (isActive ? ' active' : '')}
          >
            <span className="navbar__icon">{l.icon}</span>
            <span className="link-label">{l.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="navbar__right">
        {user && (
          <div className="navbar__user">
            <div className="navbar__avatar">{initials}</div>
            <div>
              <div className="navbar__username">
                {user.name}
                {user?.isAdmin && <span className="badge-admin" style={{ marginLeft: 8 }}>ADMIN</span>}
              </div>
              <div className="navbar__group">{user?.groupName || '—'}</div>
            </div>
          </div>
        )}
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          ⏏ Выйти
        </button>
      </div>
    </nav>
  );
}
