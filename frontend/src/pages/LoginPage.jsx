import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ name: '', group_id: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
    api.get('/users/groups').then(r => setGroups(r.data)).catch(() => {});
  }, [user, navigate]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim()) { setError(t('login.errName')); return; }
    if (!form.group_id)    { setError(t('login.errGroup')); return; }
    if (!form.password)    { setError(t('login.errPassword')); return; }

    setLoading(true);
    try {
      await login(form.name.trim(), form.group_id, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || t('login.errFetch'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>
            {t('login.title').split('·').map((part, i) => (
              <span key={i}>
                {part}
                {i === 0 && <span>·</span>}
              </span>
            ))}
          </h1>
          <p>{t('login.subtitle')}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="alert alert-error">⚠ {error}</div>}

          <div className="form-group">
            <label className="form-label">{t('login.nameLabel')}</label>
            <input
              name="name" className="form-input"
              placeholder={t('login.namePlaceholder')}
              value={form.name} onChange={handleChange}
              autoComplete="username" autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('login.groupLabel')}</label>
            <select name="group_id" className="form-select" value={form.group_id} onChange={handleChange}>
              <option value="">{t('login.groupPlaceholder')}</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t('login.passwordLabel')}</label>
            <input
              name="password" type="password" className="form-input"
              placeholder={t('login.passwordPlaceholder')}
              value={form.password} onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? <><span className="spinner" style={{ width:18,height:18,borderWidth:2 }} /> {t('login.loginBtnLoading')}</> : t('login.loginBtn')}
          </button>
        </form>

        <div className="auth-switch">
          {t('login.noAccount')} <Link to="/register">{t('login.registerLink')}</Link>
        </div>
      </div>
    </div>
  );
}
