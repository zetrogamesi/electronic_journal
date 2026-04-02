import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

// ── Grade colour helper ──────────────────────────────────────────
function gradeClass(val) {
  if (!val) return '';
  if (val === '5') return 'grade-5';
  if (val === '4') return 'grade-4';
  if (val === '3') return 'grade-3';
  if (val === '2' || val === '1') return 'grade-2';
  if (val.toLowerCase() === 'н') return 'grade-н';
  return '';
}

// ── Single grade cell ────────────────────────────────────────────
function GradeCell({ value, isAdmin, onSave }) {
  const [editing,  setEditing]  = useState(false);
  const [localVal, setLocalVal] = useState(value || '');
  const inputRef = useRef();

  useEffect(() => { setLocalVal(value || ''); }, [value]);

  const commitSave = useCallback(() => {
    const trimmed = localVal.trim();
    if (trimmed !== (value || '')) onSave(trimmed);
    setEditing(false);
  }, [localVal, value, onSave]);

  const handleKeyDown = e => {
    if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); commitSave(); }
    if (e.key === 'Escape') { setLocalVal(value || ''); setEditing(false); }
  };

  // Read-only for students
  if (!isAdmin) {
    return (
      <div className={`grade-cell grade-cell--readonly ${gradeClass(value)}`}>
        {value || ''}
      </div>
    );
  }

  return (
    <div className="grade-cell">
      {editing ? (
        <input
          ref={inputRef}
          value={localVal}
          onChange={e => setLocalVal(e.target.value)}
          onBlur={commitSave}
          onKeyDown={handleKeyDown}
          maxLength={3}
          autoFocus
        />
      ) : (
        <input
          value={localVal}
          readOnly
          className={gradeClass(localVal)}
          onClick={() => { setEditing(true); setTimeout(() => inputRef.current?.select(), 20); }}
          onFocus={() => { setEditing(true); setTimeout(() => inputRef.current?.select(), 20); }}
          title="Нажмите для редактирования"
          style={{ cursor: 'text' }}
          tabIndex={0}
        />
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────
export default function JournalPage() {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toasts, success, error: toastError } = useToast();

  const [journal,    setJournal]    = useState(null);
  const [grades,     setGrades]     = useState({});   // key: `${rowId}_${colId}`
  const [loading,    setLoading]    = useState(true);
  const [pageError,  setPageError]  = useState('');
  const [saving,     setSaving]     = useState(false);
  const [addColOpen, setAddColOpen] = useState(false);
  const [newDate,    setNewDate]    = useState('');

  useEffect(() => { loadJournal(); }, [id]);

  const loadJournal = async () => {
    setLoading(true);
    setPageError('');
    try {
      const res = await api.get(`/journals/${id}`);
      const data = res.data;
      setJournal(data);

      // Build grades lookup: `${rowId}_${columnId}` → value
      const map = {};
      (data.students || []).forEach(st => {
        (st.grades || []).forEach(g => {
          map[`${st.rowId}_${g.columnId}`] = g.value || '';
        });
      });
      setGrades(map);
    } catch (err) {
      setPageError(err.response?.data?.error || t('journal.errLoad'));
    } finally {
      setLoading(false);
    }
  };

  // Optimistic grade save
  const handleGradeSave = async (rowId, columnId, value) => {
    const key  = `${rowId}_${columnId}`;
    const prev = grades[key] || '';
    if (value === prev) return;

    setGrades(g => ({ ...g, [key]: value }));
    setSaving(true);
    try {
      await api.put('/journals/grades/upsert', {
        journal_id: id,
        row_id:     rowId,
        column_id:  columnId,
        value,
      });
    } catch (err) {
      setGrades(g => ({ ...g, [key]: prev })); // rollback
      toastError(err.response?.data?.error || t('journal.errSaveGrade'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddColumn = async () => {
    if (!newDate) return;
    try {
      await api.post(`/journals/${id}/columns`, { lesson_date: newDate });
      success(t('journal.msgDateAdded'));
      setAddColOpen(false);
      setNewDate('');
      loadJournal();
    } catch (err) {
      toastError(err.response?.data?.error || t('journal.errAddDate'));
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('journal.confirmDelete'))) return;
    try {
      await api.delete(`/journals/${id}`);
      navigate('/');
    } catch (err) {
      toastError(err.response?.data?.error || t('journal.errDelete'));
    }
  };

  const fmtDate = d =>
    new Date(d).toLocaleDateString(t('home.localeDate') || 'ru-RU', { day: 'numeric', month: 'short' });

  // ── Loading / Error states ────────────────────────────────────
  if (loading) return (
    <div className="loader-wrap">
      <div className="spinner" />
      <span style={{ color: 'var(--text3)' }}>{t('home.loading')}</span>
    </div>
  );

  if (pageError) return (
    <div className="page-wrap">
      <div className="alert alert-error">⚠ {pageError}</div>
      <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
        {t('journal.backToHome')}
      </button>
    </div>
  );

  const { columns = [], students = [] } = journal;

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="page-wrap page-wrap--wide fade-in">
      <ToastContainer toasts={toasts} />

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>{t('journal.back')}</button>
            {journal.groupName   && <span className="chip chip-blue">{journal.groupName}</span>}
            {journal.subjectName && <span className="chip chip-green">{journal.subjectName}</span>}
            {saving && <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{t('journal.saving')}</span>}
          </div>
          <h1 className="page-title">{journal.title}</h1>
          <p className="page-subtitle">
            {t('journal.studentsCount', { count: students.length })} · {t('journal.columnsCount', { count: columns.length })}
          </p>
        </div>

        {user?.isAdmin && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setAddColOpen(true)}>
              {t('journal.addDateBtn')}
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>
              {t('journal.deleteBtn')}
            </button>
          </div>
        )}
      </div>

      {/* ── Admin hint ── */}
      {user?.isAdmin && (
        <div className="alert alert-info" style={{ marginBottom: 16 }}>
          {t('journal.adminHint')}
        </div>
      )}

      {/* ── Journal table ── */}
      {students.length === 0 ? (
        <div className="empty">
          <div className="empty__icon"></div>
          <div className="empty__text">{t('journal.emptyGroup')}</div>
        </div>
      ) : (
        <div className="journal-table-wrap">
          <table className="journal-table">
            <thead>
              <tr>
                <th className="col-name">{t('journal.colNumName')}</th>
                {columns.map(col => (
                  <th key={col._id}>{fmtDate(col.lessonDate)}</th>
                ))}
                <th style={{ minWidth: 56, background: 'var(--bg3)' }}>{t('journal.colAvg')}</th>
              </tr>
            </thead>
            <tbody>
              {students.map((st, idx) => {
                const vals = columns.map(col => grades[`${st.rowId}_${col._id}`] || '');
                const nums = vals.filter(v => ['1','2','3','4','5'].includes(v)).map(Number);
                const avg  = nums.length
                  ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1)
                  : '—';
                const avgColor =
                  avg === '—'            ? 'var(--text3)'  :
                  parseFloat(avg) >= 4.5 ? 'var(--green)'  :
                  parseFloat(avg) >= 3.5 ? 'var(--accent2)':
                  parseFloat(avg) >= 2.5 ? 'var(--yellow)' : 'var(--red)';

                return (
                  <tr key={st.rowId}>
                    <td className="col-name">
                      <span style={{ color: 'var(--text3)', marginRight: 10, fontSize: '0.8rem' }}>
                        {idx + 1}.
                      </span>
                      {st.studentName}
                    </td>
                    {columns.map(col => {
                      const key = `${st.rowId}_${col._id}`;
                      return (
                        <td key={col._id}>
                          <GradeCell
                            value={grades[key] || ''}
                            isAdmin={!!user?.isAdmin}
                            onSave={val => handleGradeSave(st.rowId, col._id, val)}
                          />
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'center', fontWeight: 700, color: avgColor }}>
                      {avg}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add date modal ── */}
      {addColOpen && (
        <div className="modal-overlay" onClick={() => setAddColOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <span className="modal__title">{t('journal.modalAddDate')}</span>
              <button className="modal__close" onClick={() => setAddColOpen(false)}>×</button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label className="form-label">{t('journal.modalDateLabel')}</label>
                <input
                  type="date"
                  className="form-input"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={() => setAddColOpen(false)}>{t('journal.cancel')}</button>
                <button className="btn btn-primary" onClick={handleAddColumn} disabled={!newDate}>
                  {t('journal.add')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
