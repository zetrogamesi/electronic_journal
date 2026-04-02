import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:16, padding:24
    }}>
      <div style={{ fontSize:'6rem', lineHeight:1 }}>{t('notfound.title')}</div>
      <h1 style={{ fontFamily:'var(--font-head)', fontSize:'1.8rem', color:'var(--text)' }}>
        {t('notfound.subtitle')}
      </h1>
      <p style={{ color:'var(--text3)', fontSize:'0.95rem' }} />
      <button className="btn btn-primary" onClick={() => navigate('/')}>
        {t('notfound.backToHome')}
      </button>
    </div>
  );
}
