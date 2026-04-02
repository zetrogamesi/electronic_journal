import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import api from '../services/api';

export default function GroupStatsChart() {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/journals/stats/performance')
      .then(res => setData(res.data.slice(0, 5))) // top 5 groups
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="card" style={{ height: 300, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="spinner" />
    </div>
  );

  if (data.length === 0) return null;

  // Colors for bars
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)' }}>
          <p style={{ margin: 0, fontWeight: 700 }}>{label}</p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: payload[0].fill }}>
            {`${t('home.avgGrade') || 'Средний балл'}: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card" style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontFamily:'var(--font-head)', fontSize:'1.1rem', marginBottom:20 }}>
        {t('home.topGroups') || 'Рейтинг групп'}
      </h3>
      <div style={{ flex: 1, minHeight: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text3)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--text3)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 5]} tickCount={6} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="avg" radius={[4, 4, 0, 0]} maxBarSize={60}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
