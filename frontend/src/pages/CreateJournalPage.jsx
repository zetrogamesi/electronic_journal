import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

export default function CreateJournalPage() {
  const navigate = useNavigate();
  const { toasts, success, error: toastError } = useToast();

  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ title: '', group_id: '', subject_id: '' });
  const [dates, setDates] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/users/groups'), api.get('/users/subjects')])
      .then(([g, s]) => { setGroups(g.data); setSubjects(s.data); })
      .catch(() => toastError('Ошибка загрузки данных'));
  }, []);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const addDate = () => setDates(d => [...d, '']);
  const removeDate = i => setDates(d => d.filter((_, idx) => idx !== i));
  const setDate = (i, val) => setDates(d => d.map((v, idx) => idx === i ? val : v));

  const fillDates = () => {
    // Auto-fill with weekdays (Mon–Fri) for the current month, max 16
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const filled = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(year, month, d);
      const dow = dt.getDay(); // 0=Sun 6=Sat
      if (dow !== 0 && dow !== 6) {
        const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        filled.push(iso);
      }
      if (filled.length >= 16) break;
    }
    if (filled.length > 0) setDates(filled);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Введите название журнала'); return; }
    if (!form.group_id) { setError('Выберите группу'); return; }
    const validDates = dates.filter(d => d.trim());
    if (validDates.length === 0) { setError('Добавьте хотя бы одну дату'); return; }

    setLoading(true);
    try {
      const res = await api.post('/journals', {
        title: form.title.trim(),
        group_id: form.group_id,
        subject_id: form.subject_id || null,
        dates: validDates
      });
      success('Журнал создан!');
      setTimeout(() => navigate(`/journal/${res.data.journal.id}`), 800);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка создания журнала');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap fade-in" style={{ maxWidth: 720 }}>
      <ToastContainer toasts={toasts} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Создать журнал</h1>
          <p className="page-subtitle">Новый журнал будет виден всем студентам выбранной группы</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>← Назад</button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom:20 }}>⚠ {error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="card" style={{ marginBottom:20 }}>
          <h3 style={{ fontFamily:'var(--font-head)', marginBottom:18, fontSize:'1rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.06em' }}>
            Основная информация
          </h3>
          <div className="modal-form">
            <div className="form-group">
              <label className="form-label">Название журнала *</label>
              <input
                name="title" className="form-input"
                placeholder="Например: Информатика — 2-й семестр"
                value={form.title} onChange={handleChange} autoFocus
              />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div className="form-group">
                <label className="form-label">Группа *</label>
                <select name="group_id" className="form-select" value={form.group_id} onChange={handleChange}>
                  <option value="">Выберите группу...</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Предмет</label>
                <select name="subject_id" className="form-select" value={form.subject_id} onChange={handleChange}>
                  <option value="">Без предмета</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <h3 style={{ fontFamily:'var(--font-head)', fontSize:'1rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.06em' }}>
              Даты уроков
            </h3>
            <div style={{ display:'flex', gap:8 }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={fillDates}>
                📅 Авто (будни)
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addDate}>
                + Добавить дату
              </button>
            </div>
          </div>

          {dates.length === 0 && (
            <div className="alert alert-info">Добавьте хотя бы одну дату урока</div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
            {dates.map((d, i) => (
              <div key={i} style={{ display:'flex', gap:6, alignItems:'center' }}>
                <input
                  type="date" className="form-input"
                  value={d} onChange={e => setDate(i, e.target.value)}
                  style={{ flex:1 }}
                />
                {dates.length > 1 && (
                  <button type="button" className="btn btn-danger btn-xs" onClick={() => removeDate(i)} title="Удалить">✕</button>
                )}
              </div>
            ))}
          </div>

          <p className="form-hint" style={{ marginTop:12 }}>
            Добавлено дат: <strong>{dates.filter(d=>d).length}</strong>
            &nbsp;·&nbsp; Каждая дата — это колонка в журнале
          </p>
        </div>

        <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
            Отмена
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Создание...' : '✓ Создать журнал'}
          </button>
        </div>
      </form>
    </div>
  );
}
