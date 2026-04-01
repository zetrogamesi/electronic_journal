import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
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
    if (!nameForm.name.trim()) { setNameError('Имя не может быть пустым'); return; }
    if (nameForm.name.trim() === user?.name) { setNameError('Имя не изменилось'); return; }

    setNameLoading(true);
    try {
      const res = await api.put('/users/me', { name: nameForm.name.trim() });
      updateUser({ ...user, name: res.data.user.name });
      success('Имя успешно обновлено');
    } catch (err) {
      toastError(err.response?.data?.error || 'Ошибка сохранения');
    } finally {
      setNameLoading(false);
    }
  };

  const handlePwSave = async e => {
    e.preventDefault();
    setPwError('');
    if (pwForm.password.length < 6)  { setPwError('Пароль не менее 6 символов'); return; }
    if (pwForm.password !== pwForm.confirm) { setPwError('Пароли не совпадают'); return; }

    setPwLoading(true);
    try {
      await api.put('/users/me', { password: pwForm.password });
      setPwForm({ password: '', confirm: '' });
      success('Пароль успешно изменён');
    } catch (err) {
      toastError(err.response?.data?.error || 'Ошибка смены пароля');
    } finally {
      setPwLoading(false);
    }
  };

  const initials = user?.name
    ? user.name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const joinDate = user?.createdAt
    ? new Date(user?.createdAt).toLocaleDateString('ru-RU', { day:'numeric', month:'long', year:'numeric' })
    : '—';

  return (
    <div className="page-wrap fade-in" style={{ maxWidth: 760 }}>
      <ToastContainer toasts={toasts} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Профиль</h1>
          <p className="page-subtitle">Управление аккаунтом</p>
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
          <div style={{ fontSize:'1.3rem', fontWeight:700, color:'var(--text)' }}>
            {user?.name}
            {user?.isAdmin && <span className="badge-admin" style={{ marginLeft:10 }}>ADMIN</span>}
          </div>
          <div style={{ color:'var(--text3)', marginTop:4, fontSize:'0.88rem' }}>
            Группа: <strong style={{ color:'var(--text2)' }}>{user?.groupName || '—'}</strong>
            &nbsp;·&nbsp; Дата регистрации: <strong style={{ color:'var(--text2)' }}>{joinDate}</strong>
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
        {/* Change name */}
        <div className="card">
          <h2 style={{ fontFamily:'var(--font-head)', fontSize:'1.1rem', marginBottom:18 }}>
            ✏️ Изменить имя
          </h2>
          <form onSubmit={handleNameSave} noValidate>
            <div className="modal-form">
              {nameError && <div className="alert alert-error">⚠ {nameError}</div>}
              <div className="form-group">
                <label className="form-label">Новое имя</label>
                <input
                  className="form-input"
                  value={nameForm.name}
                  onChange={e => { setNameForm({ name: e.target.value }); setNameError(''); }}
                  placeholder="Введите имя"
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={nameLoading}>
                {nameLoading ? 'Сохранение...' : '✓ Сохранить имя'}
              </button>
            </div>
          </form>
        </div>

        {/* Change password */}
        <div className="card">
          <h2 style={{ fontFamily:'var(--font-head)', fontSize:'1.1rem', marginBottom:18 }}>
            🔒 Изменить пароль
          </h2>
          <form onSubmit={handlePwSave} noValidate>
            <div className="modal-form">
              {pwError && <div className="alert alert-error">⚠ {pwError}</div>}
              <div className="form-group">
                <label className="form-label">Новый пароль</label>
                <input
                  type="password" className="form-input"
                  value={pwForm.password}
                  onChange={e => { setPwForm(f => ({ ...f, password: e.target.value })); setPwError(''); }}
                  placeholder="Минимум 6 символов"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Подтвердите пароль</label>
                <input
                  type="password" className="form-input"
                  value={pwForm.confirm}
                  onChange={e => { setPwForm(f => ({ ...f, confirm: e.target.value })); setPwError(''); }}
                  placeholder="Повторите пароль"
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={pwLoading}>
                {pwLoading ? 'Сохранение...' : '✓ Сменить пароль'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
