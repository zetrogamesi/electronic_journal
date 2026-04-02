import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const NAV_LINKS = [
  { to: '/',            icon: '', labelKey: 'home',          adminOnly: false },
  { to: '/profile',     icon: '', labelKey: 'profile',       adminOnly: false },
  { to: '/journal/new', icon: '', labelKey: 'createJournal', adminOnly: true  },
  { to: '/admin',       icon: '', labelKey: 'admin',         adminOnly: true  },
];

// ── Theme toggle hook ────────────────────────────────────────────
function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'dark'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return { theme, toggle };
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme, toggle } = useTheme();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name
    ? user.name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const visibleLinks = NAV_LINKS.filter(l => !l.adminOnly || user?.isAdmin);

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar__brand" style={{ textDecoration: 'none' }}>
        {t('navbar.brand').split('·').map((part, i) => (
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
        {/* Theme toggle button */}
        <button
          className="btn btn-ghost btn-sm theme-toggle"
          onClick={toggle}
          title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
          style={{ fontSize: '1.1rem', padding: '6px 10px' }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <LanguageSwitcher />

        {user && (
          <div className="navbar__user">
            <div className="navbar__avatar">{initials}</div>
            <div>
              <div className="navbar__username">
                {user.name}
                {user?.isAdmin   && <span className="badge-admin"    style={{ marginLeft: 8 }}>{t('navbar.adminBadge')}</span>}
                {user?.isTeacher && <span className="badge-teacher"  style={{ marginLeft: 6 }}>TEACHER</span>}
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
