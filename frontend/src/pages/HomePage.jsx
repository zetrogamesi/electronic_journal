import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import GroupStatsChart from '../components/GroupStatsChart';

function JournalCard({ journal, onClick, t }) {
  const dateStr = new Date(journal.createdAt).toLocaleDateString(t('home.localeDate') || 'ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="card card--interactive fade-in" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="card__header">
        <div>
          <div className="card__title">{journal.title}</div>
          <div className="card__meta">{t('home.createdAt', { date: dateStr })}</div>
        </div>
        <span className="chip chip-blue">{journal.groupName}</span>
      </div>

      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:8 }}>
        {journal.subjectName && (
          <span className="chip chip-green">{journal.subjectName}</span>
        )}
        <span className="chip chip-yellow">{t('home.students', { count: journal.studentCount })}</span>
        <span className="chip" style={{ background:'var(--bg3)', color:'var(--text3)' }}>
          📅 {t('home.days', { count: journal.columnCount })}
        </span>
      </div>

      <div style={{ marginTop:16, color:'var(--accent)', fontSize:'0.82rem', fontWeight:600 }}>
        {t('home.openJournal')}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/journals')
      .then(r => setJournals(r.data))
      .catch(err => setError(err.response?.data?.error || 'Ошибка загрузки журналов'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = journals.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.groupName?.toLowerCase().includes(search.toLowerCase()) ||
    j.subjectName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="loader-wrap">
      <div className="spinner" />
      <span style={{ color:'var(--text3)' }}>{t('home.loading')}</span>
    </div>
  );

  return (
    <div className="page-wrap fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('home.myJournals')}</h1>
          <p className="page-subtitle">
            {user?.groupName
              ? t('home.groupJournals', { group: user?.groupName, count: filtered.length })
              : t('home.journalsInSystem', { count: filtered.length })}
          </p>
        </div>
        {user?.isAdmin && (
          <button className="btn btn-primary" onClick={() => navigate('/journal/new')}>
            {t('home.createJournal')}
          </button>
        )}
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom:20 }}>⚠ {error}</div>}

      {/* Stats row */}
      <div className="grid" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', marginBottom:28 }}>
        <div className="stat-card">
          <div className="stat-card__value">{journals.length}</div>
          <div className="stat-card__label">{t('home.totalJournals')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">
            {[...new Set(journals.map(j => j.subjectName).filter(Boolean))].length}
          </div>
          <div className="stat-card__label">{t('home.totalSubjects')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">
            {journals.reduce((s, j) => s + parseInt(j.columnCount || 0), 0)}
          </div>
          <div className="stat-card__label">{t('home.totalRecords')}</div>
        </div>
      </div>

      <div className="home-layout">
        <div>
          {/* Search */}
          <div style={{ marginBottom: 20 }}>
            <input
              className="form-input"
              placeholder={t('home.search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: 420 }}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="empty">
              <div className="empty__icon"></div>
              <div className="empty__text">
                {search ? t('home.emptySearch') : t('home.emptyJournals')}
              </div>
              {user?.isAdmin && !search && (
                <button className="btn btn-primary" style={{ marginTop:16 }} onClick={() => navigate('/journal/new')}>
                  {t('home.createFirst')}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-2">
              {filtered.map(j => (
                <JournalCard
                  key={j.id}
                  journal={j}
                  t={t}
                  onClick={() => navigate(`/journal/${j.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        <div style={{ position: 'sticky', top: 88, height: 400 }}>
          <GroupStatsChart />
        </div>
      </div>
    </div>
  );
}

