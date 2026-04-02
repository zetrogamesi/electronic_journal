import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const { toasts, success, error: toastError } = useToast();

  const [nameForm, setNameForm] = useState({ name: user?.name || '' });
  const [pwForm, setPwForm] = useState({ password: '', confirm: '' });
  const [nameLoading, setNameLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [pwError, setPwError] = useState('');

  const handleNameSave = async e => {
    e.preventDefault();
    setNameError('');
    if (!nameForm.name.trim()) { setNameError(t('profile.errNameEmpty')); return; }
    if (nameForm.name.trim() === user?.name) { setNameError(t('profile.errNameSame')); return; }

    setNameLoading(true);
    try {
      const res = await api.put('/users/me', { name: nameForm.name.trim() });
      updateUser({ ...user, name: res.data.user.name });
      success(t('profile.msgNameSuccess'));
    } catch (err) {
      toastError(err.response?.data?.error || t('admin.errGeneric'));
    } finally {
      setNameLoading(false);
    }
  };

  const handlePwSave = async e => {
    e.preventDefault();
    setPwError('');
    if (pwForm.password.length < 6)  { setPwError(t('profile.errPwLen')); return; }
    if (pwForm.password !== pwForm.confirm) { setPwError(t('profile.errPwMatch')); return; }

    setPwLoading(true);
    try {
      await api.put('/users/me', { password: pwForm.password });
      setPwForm({ password: '', confirm: '' });
      success(t('profile.msgPwSuccess'));
    } catch (err) {
      toastError(err.response?.data?.error || t('admin.errGeneric'));
    } finally {
      setPwLoading(false);
    }
  };

  const initials = user?.name
    ? user.name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const joinDate = user?.createdAt
    ? new Date(user?.createdAt).toLocaleDateString(t('home.localeDate') || 'ru-RU', { day:'numeric', month:'long', year:'numeric' })
    : '—';

  return (
    <div className="page-wrap fade-in" style={{ maxWidth: 760 }}>
      <ToastContainer toasts={toasts} />

      <div className="page-header">
        <div>
          <h1 className="page-title">{t('profile.title')}</h1>
          <p className="page-subtitle">{t('profile.subtitle')}</p>
        </div>
      </div>

      {/* Profile card */}
      <div className="card" style={{ display:'flex', alignItems:'center', gap:24, marginBottom:28 }}>
        <div style={{
          width:72, height:72, borderRadius:'50%',
          background:'var(--accent-bg)', border:'3px solid var(--accent)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'1.8rem', fontWeight:700, color:'var(--accent)', flexShrink:0
        }}>
          {initials}
        </div>
        <div>
          <div style={{ fontSize:'1.3rem', fontWeight:700, color:'var(--text)', display:'flex', alignItems:'center', flexWrap:'wrap', gap:8 }}>
            {user?.name}
            {user?.isAdmin   && <span className="badge-admin">{t('profile.adminBadge')}</span>}
            {user?.isTeacher && <span className="badge-teacher">TEACHER</span>}
          </div>
          <div style={{ color:'var(--text3)', marginTop:4, fontSize:'0.88rem' }}>
            {t('profile.group')} <strong style={{ color:'var(--text2)' }}>{user?.groupName || '—'}</strong>
            &nbsp;·&nbsp; {t('profile.joinDate')} <strong style={{ color:'var(--text2)' }}>{joinDate}</strong>
          </div>
          {user?.isTeacher && (
            <div style={{ marginTop: 8 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--green-bg)', color: 'var(--green)',
                border: '1px solid var(--green)', borderRadius: 8,
                padding: '4px 12px', fontSize: '0.82rem', fontWeight: 600
              }}>
                Вы являетесь учителем — можете выставлять оценки в назначенных журналах
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
        {/* Change name */}
        <div className="card">
          <h2 style={{ fontFamily:'var(--font-head)', fontSize:'1.1rem', marginBottom:18 }}>
            {t('profile.editName')}
          </h2>
          <form onSubmit={handleNameSave} noValidate>
            <div className="modal-form">
              {nameError && <div className="alert alert-error">⚠ {nameError}</div>}
              <div className="form-group">
                <label className="form-label">{t('profile.newName')}</label>
                <input
                  className="form-input"
                  value={nameForm.name}
                  onChange={e => { setNameForm({ name: e.target.value }); setNameError(''); }}
                  placeholder={t('profile.newNamePlaceholder')}
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={nameLoading}>
                {nameLoading ? t('profile.saveNameLoading') : t('profile.saveName')}
              </button>
            </div>
          </form>
        </div>

        {/* Change password */}
        <div className="card">
          <h2 style={{ fontFamily:'var(--font-head)', fontSize:'1.1rem', marginBottom:18 }}>
            {t('profile.editPassword')}
          </h2>
          <form onSubmit={handlePwSave} noValidate>
            <div className="modal-form">
              {pwError && <div className="alert alert-error">⚠ {pwError}</div>}
              <div className="form-group">
                <label className="form-label">{t('profile.newPassword')}</label>
                <input
                  type="password" className="form-input"
                  value={pwForm.password}
                  onChange={e => { setPwForm(f => ({ ...f, password: e.target.value })); setPwError(''); }}
                  placeholder={t('profile.newPasswordPlaceholder')}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('profile.confirmPassword')}</label>
                <input
                  type="password" className="form-input"
                  value={pwForm.confirm}
                  onChange={e => { setPwForm(f => ({ ...f, confirm: e.target.value })); setPwError(''); }}
                  placeholder={t('profile.confirmPasswordPlaceholder')}
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={pwLoading}>
                {pwLoading ? t('profile.savePasswordLoading') : t('profile.savePassword')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
