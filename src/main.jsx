import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
import './i18n';

class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(err) {
    return { error: err };
  }
  componentDidCatch(err, info) {
    console.error('App error:', err, info);
  }
  render() {
    if (this.state.error) {
      const e = this.state.error;
      return (
        <div
          style={{
            padding: '2rem',
            background: '#0a0a0a',
            color: '#ff6b6b',
            minHeight: '100vh',
            fontFamily: 'monospace',
            fontSize: '14px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Kayfabe Engine – Błąd aplikacji</h2>
          <p><strong>{e?.message ?? String(e)}</strong></p>
          {e?.stack && <pre style={{ marginTop: '1rem', color: '#888', fontSize: '12px' }}>{e.stack}</pre>}
        </div>
      );
    }
    return this.props.children;
  }
}

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (err) {
  document.getElementById('root').innerHTML =
    '<div style="padding:2rem;background:#0a0a0a;color:#ff6b6b;min-height:100vh;font-family:monospace;font-size:14px;">' +
    '<h2 style="color:#fff">Kayfabe Engine – Błąd przy starcie</h2><pre>' +
    (err?.message || String(err)) + '</pre></div>';
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if (import.meta.env.DEV) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        if (regs.length > 0) {
          regs.forEach((registration) => registration.unregister());
        }
      });
    } else {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('[SW] Registration failed:', err);
      });
    }
  });
}
