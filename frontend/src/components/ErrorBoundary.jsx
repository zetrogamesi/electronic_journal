import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24,
          background: 'var(--bg)'
        }}>
          <div style={{ fontSize: '3rem' }}>⚠️</div>
          <h2 style={{ fontFamily: 'var(--font-head)', color: 'var(--text)', fontSize: '1.4rem' }}>
            Что-то пошло не так
          </h2>
          <p style={{ color: 'var(--text3)', maxWidth: 400, textAlign: 'center' }}>
            {this.state.error?.message || 'Произошла непредвиденная ошибка'}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
          >
            ← На главную
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
