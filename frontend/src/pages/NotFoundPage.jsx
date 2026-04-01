import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:16, padding:24
    }}>
      <div style={{ fontSize:'6rem', lineHeight:1 }}>404</div>
      <h1 style={{ fontFamily:'var(--font-head)', fontSize:'1.8rem', color:'var(--text)' }}>
        Страница не найдена
      </h1>
      <p style={{ color:'var(--text3)', fontSize:'0.95rem' }}>
        Такой страницы не существует или она была удалена
      </p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>
        ← На главную
      </button>
    </div>
  );
}
