import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ name: '', group_id: '', password: '', confirm: '' });
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
    if (!form.name.trim())   { setError('Введите имя'); return; }
    if (!form.group_id)      { setError('Выберите группу'); return; }
    if (form.password.length < 6) { setError('Пароль не менее 6 символов'); return; }
    if (form.password !== form.confirm) { setError('Пароли не совпадают'); return; }

    setLoading(true);
    try {
      await register(form.name.trim(), form.group_id, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>Э<span>·</span>Журнал</h1>
          <p>Создайте аккаунт</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="alert alert-error">⚠ {error}</div>}

          <div className="form-group">
            <label className="form-label">Имя</label>
            <input
              name="name" className="form-input"
              placeholder="Иван Иванов"
              value={form.name} onChange={handleChange}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Группа</label>
            <select name="group_id" className="form-select" value={form.group_id} onChange={handleChange}>
              <option value="">Выберите группу...</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input
              name="password" type="password" className="form-input"
              placeholder="Минимум 6 символов"
              value={form.password} onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Подтвердите пароль</label>
            <input
              name="confirm" type="password" className="form-input"
              placeholder="Повторите пароль"
              value={form.confirm} onChange={handleChange}
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
            {loading
              ? <><span className="spinner" style={{ width:18,height:18,borderWidth:2 }} /> Регистрация...</>
              : '✓ Зарегистрироваться'}
          </button>
        </form>

        <div className="auth-switch">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </div>
      </div>
    </div>
  );
}
