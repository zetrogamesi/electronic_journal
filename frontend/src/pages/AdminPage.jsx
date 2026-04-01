import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <span className="modal__title">{title}</span>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const { toasts, success, error: toastError } = useToast();

  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newGroup, setNewGroup] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [groupModal, setGroupModal] = useState(false);
  const [subjectModal, setSubjectModal] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/users'),
      api.get('/users/groups'),
      api.get('/users/subjects')
    ]).then(([u, g, s]) => {
      setUsers(u.data);
      setGroups(g.data);
      setSubjects(s.data);
    }).catch(() => toastError('Ошибка загрузки данных'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const toggleAdmin = async (userId) => {
    try {
      const res = await api.put(`/users/${userId}/admin`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isAdmin: res.data.user?.isAdmin } : u));
      success(res.data.message);
    } catch (err) {
      toastError(err.response?.data?.error || 'Ошибка');
    }
  };

  const deleteUser = async (userId, name) => {
    if (!confirm(`Удалить пользователя "${name}"?`)) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      success('Пользователь удалён');
    } catch (err) {
      toastError(err.response?.data?.error || 'Ошибка');
    }
  };

  const createGroup = async () => {
    if (!newGroup.trim()) return;
    try {
      const res = await api.post('/users/groups', { name: newGroup.trim() });
      setGroups(prev => [...prev, res.data]);
      setNewGroup('');
      setGroupModal(false);
      success('Группа создана');
    } catch (err) {
      toastError(err.response?.data?.error || 'Ошибка');
    }
  };

  const createSubject = async () => {
    if (!newSubject.trim()) return;
    try {
      const res = await api.post('/users/subjects', { name: newSubject.trim() });
      setSubjects(prev => [...prev, res.data]);
      setNewSubject('');
      setSubjectModal(false);
      success('Предмет создан');
    } catch (err) {
      toastError(err.response?.data?.error || 'Ошибка');
    }
  };

  const tabs = [
    { key: 'users',    label: '👥 Пользователи' },
    { key: 'groups',   label: '🏫 Группы' },
    { key: 'subjects', label: '📚 Предметы' },
  ];

  return (
    <div className="page-wrap fade-in">
      <ToastContainer toasts={toasts} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Панель администратора</h1>
          <p className="page-subtitle">Управление пользователями, группами и предметами</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', marginBottom:28 }}>
        {[
          { value: users.length,    label: 'Пользователей' },
          { value: users.filter(u=>u.isAdmin).length, label: 'Администраторов' },
          { value: groups.length,   label: 'Групп' },
          { value: subjects.length, label: 'Предметов' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card__value">{s.value}</div>
            <div className="stat-card__label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20, borderBottom:'1px solid var(--border)', paddingBottom:0 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            className="btn btn-ghost btn-sm"
            style={{
              borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
              borderRadius:'var(--radius-sm) var(--radius-sm) 0 0',
              color: tab === t.key ? 'var(--accent2)' : 'var(--text3)',
              background: tab === t.key ? 'var(--accent-bg)' : 'transparent'
            }}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loader-wrap"><div className="spinner" /></div>
      ) : (
        <>
          {/* Users tab */}
          {tab === 'users' && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Имя</th><th>Группа</th><th>Роль</th><th>Дата регистрации</th><th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ color:'var(--text)', fontWeight:500 }}>
                        {u.name}
                        {u.id === user.id && <span style={{ color:'var(--text3)', fontSize:'0.75rem', marginLeft:6 }}>(вы)</span>}
                      </td>
                      <td>{u.groupName ? <span className="chip chip-blue">{u.groupName}</span> : <span style={{ color:'var(--text3)' }}>—</span>}</td>
                      <td>
                        {u.isAdmin
                          ? <span className="chip chip-yellow">⚙️ Администратор</span>
                          : <span className="chip" style={{ background:'var(--bg3)', color:'var(--text3)' }}>Студент</span>}
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString('ru-RU')}</td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          {u.id !== user.id && (
                            <>
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => toggleAdmin(u.id)}
                                title={u.isAdmin ? 'Снять права' : 'Дать права'}
                              >
                                {u.isAdmin ? '↓ Студент' : '↑ Админ'}
                              </button>
                              <button className="btn btn-danger btn-xs" onClick={() => deleteUser(u.id, u.name)}>
                                🗑
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Groups tab */}
          {tab === 'groups' && (
            <>
              <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:14 }}>
                <button className="btn btn-primary btn-sm" onClick={() => setGroupModal(true)}>+ Новая группа</button>
              </div>
              <div className="grid grid-3">
                {groups.map(g => (
                  <div key={g.id} className="card">
                    <div style={{ fontSize:'1.5rem', marginBottom:8 }}>🏫</div>
                    <div style={{ fontWeight:700, color:'var(--text)' }}>{g.name}</div>
                    <div style={{ fontSize:'0.8rem', color:'var(--text3)', marginTop:4 }}>
                      {users.filter(u => u.groupId === String(g.id)).length} студентов
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Subjects tab */}
          {tab === 'subjects' && (
            <>
              <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:14 }}>
                <button className="btn btn-primary btn-sm" onClick={() => setSubjectModal(true)}>+ Новый предмет</button>
              </div>
              <div className="grid grid-3">
                {subjects.map(s => (
                  <div key={s.id} className="card">
                    <div style={{ fontSize:'1.5rem', marginBottom:8 }}>📚</div>
                    <div style={{ fontWeight:700, color:'var(--text)' }}>{s.name}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Group modal */}
      {groupModal && (
        <Modal title="Новая группа" onClose={() => setGroupModal(false)}>
          <div className="modal-form">
            <div className="form-group">
              <label className="form-label">Название группы</label>
              <input
                className="form-input"
                value={newGroup}
                onChange={e => setNewGroup(e.target.value)}
                placeholder="Например: ИС-23"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && createGroup()}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setGroupModal(false)}>Отмена</button>
              <button className="btn btn-primary" onClick={createGroup}>Создать</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Subject modal */}
      {subjectModal && (
        <Modal title="Новый предмет" onClose={() => setSubjectModal(false)}>
          <div className="modal-form">
            <div className="form-group">
              <label className="form-label">Название предмета</label>
              <input
                className="form-input"
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
                placeholder="Например: Физика"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && createSubject()}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setSubjectModal(false)}>Отмена</button>
              <button className="btn btn-primary" onClick={createSubject}>Создать</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
