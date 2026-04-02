import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
    }).catch(() => toastError(t('admin.errLoad')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const toggleAdmin = async (userId) => {
    try {
      const res = await api.put(`/users/${userId}/admin`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isAdmin: res.data.user?.isAdmin } : u));
      success(res.data.message);
    } catch (err) {
      toastError(err.response?.data?.error || t('admin.errGeneric'));
    }
  };

  const deleteUser = async (userId, name) => {
    if (!confirm(t('admin.confirmDeleteUser', { name }))) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      success(t('admin.msgUserDeleted'));
    } catch (err) {
      toastError(err.response?.data?.error || t('admin.errGeneric'));
    }
  };

  const createGroup = async () => {
    if (!newGroup.trim()) return;
    try {
      const res = await api.post('/users/groups', { name: newGroup.trim() });
      setGroups(prev => [...prev, res.data]);
      setNewGroup('');
      setGroupModal(false);
      success(t('admin.msgGroupCreated'));
    } catch (err) {
      toastError(err.response?.data?.error || t('admin.errGeneric'));
    }
  };

  const createSubject = async () => {
    if (!newSubject.trim()) return;
    try {
      const res = await api.post('/users/subjects', { name: newSubject.trim() });
      setSubjects(prev => [...prev, res.data]);
      setNewSubject('');
      setSubjectModal(false);
      success(t('admin.msgSubjectCreated'));
    } catch (err) {
      toastError(err.response?.data?.error || t('admin.errGeneric'));
    }
  };

  const tabs = [
    { key: 'users',    label: t('admin.tabUsers') },
    { key: 'groups',   label: t('admin.tabGroups') },
    { key: 'subjects', label: t('admin.tabSubjects') },
  ];

  return (
    <div className="page-wrap fade-in">
      <ToastContainer toasts={toasts} />

      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.title')}</h1>
          <p className="page-subtitle">{t('admin.subtitle')}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', marginBottom:28 }}>
        {[
          { value: users.length,    label: t('admin.statUsers') },
          { value: users.filter(u=>u.isAdmin).length, label: t('admin.statAdmins') },
          { value: groups.length,   label: t('admin.statGroups') },
          { value: subjects.length, label: t('admin.statSubjects') },
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
                    <th>{t('admin.thName')}</th><th>{t('admin.thGroup')}</th><th>{t('admin.thRole')}</th><th>{t('admin.thDate')}</th><th>{t('admin.thActions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ color:'var(--text)', fontWeight:500 }}>
                        {u.name}
                        {u.id === user.id && <span style={{ color:'var(--text3)', fontSize:'0.75rem', marginLeft:6 }}>{t('admin.you')}</span>}
                      </td>
                      <td>{u.groupName ? <span className="chip chip-blue">{u.groupName}</span> : <span style={{ color:'var(--text3)' }}>{t('admin.noGroup')}</span>}</td>
                      <td>
                        {u.isAdmin
                          ? <span className="chip chip-yellow">{t('admin.roleAdmin')}</span>
                          : <span className="chip" style={{ background:'var(--bg3)', color:'var(--text3)' }}>{t('admin.roleStudent')}</span>}
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString('ru-RU')}</td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          {u.id !== user.id && (
                            <>
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => toggleAdmin(u.id)}
                                title={u.isAdmin ? t('admin.revokeTitle') : t('admin.grantTitle')}
                              >
                                {u.isAdmin ? t('admin.btnRevoke') : t('admin.btnGrant')}
                              </button>
                              <button className="btn btn-danger btn-xs" onClick={() => deleteUser(u.id, u.name)}>
                                
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
                <button className="btn btn-primary btn-sm" onClick={() => setGroupModal(true)}>{t('admin.btnNewGroup')}</button>
              </div>
              <div className="grid grid-3">
                {groups.map(g => (
                  <div key={g.id} className="card">
                    <div style={{ fontSize:'1.5rem', marginBottom:8 }}></div>
                    <div style={{ fontWeight:700, color:'var(--text)' }}>{g.name}</div>
                    <div style={{ fontSize:'0.8rem', color:'var(--text3)', marginTop:4 }}>
                      {t('admin.studentsCount', { count: users.filter(u => u.groupId === String(g.id)).length })}
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
                <button className="btn btn-primary btn-sm" onClick={() => setSubjectModal(true)}>{t('admin.btnNewSubject')}</button>
              </div>
              <div className="grid grid-3">
                {subjects.map(s => (
                  <div key={s.id} className="card">
                    <div style={{ fontSize:'1.5rem', marginBottom:8 }}></div>
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
        <Modal title={t('admin.modalNewGroup')} onClose={() => setGroupModal(false)}>
          <div className="modal-form">
            <div className="form-group">
              <label className="form-label">{t('admin.modalGroupName')}</label>
              <input
                className="form-input"
                value={newGroup}
                onChange={e => setNewGroup(e.target.value)}
                placeholder={t('admin.modalGroupPlaceholder')}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && createGroup()}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setGroupModal(false)}>{t('admin.cancel')}</button>
              <button className="btn btn-primary" onClick={createGroup}>{t('admin.create')}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Subject modal */}
      {subjectModal && (
        <Modal title={t('admin.modalNewSubject')} onClose={() => setSubjectModal(false)}>
          <div className="modal-form">
            <div className="form-group">
              <label className="form-label">{t('admin.modalSubjectName')}</label>
              <input
                className="form-input"
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
                placeholder={t('admin.modalSubjectPlaceholder')}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && createSubject()}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setSubjectModal(false)}>{t('admin.cancel')}</button>
              <button className="btn btn-primary" onClick={createSubject}>{t('admin.create')}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
