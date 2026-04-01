export default function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span style={{ marginRight: 8 }}>{icons[t.type]}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
