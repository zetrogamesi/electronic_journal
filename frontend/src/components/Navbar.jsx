import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const NAV_LINKS = [
  { to: '/',            icon: '', labelKey: 'home',        adminOnly: false },
  { to: '/profile',     icon: '', labelKey: 'profile',        adminOnly: false },
  { to: '/journal/new', icon: '', labelKey: 'createJournal', adminOnly: true  },
  { to: '/admin',       icon: '', labelKey: 'admin',     adminOnly: true  },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name
    ? user.name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const visibleLinks = NAV_LINKS.filter(l => !l.adminOnly || user?.isAdmin);

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar__brand" style={{ textDecoration: 'none' }}>
        {t('navbar.brand').split('·').map((part, i, arr) => (
          <span key={i}>
            {part}
            {i === 0 && <span style={{ color: 'var(--accent)' }}>·</span>}
          </span>
        ))}
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
            <span className="link-label">{t(`navbar.${l.labelKey}`)}</span>
          </NavLink>
        ))}
      </div>

      <div className="navbar__right">
        <LanguageSwitcher />
        {user && (
          <div className="navbar__user">
            <div className="navbar__avatar">{initials}</div>
            <div>
              <div className="navbar__username">
                {user.name}
                {user?.isAdmin && <span className="badge-admin" style={{ marginLeft: 8 }}>{t('navbar.adminBadge')}</span>}
              </div>
              <div className="navbar__group">{user?.groupName || '—'}</div>
            </div>
          </div>
        )}
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          {t('navbar.logout')}
        </button>
      </div>
    </nav>
  );
}
