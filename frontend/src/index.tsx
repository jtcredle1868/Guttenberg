import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Hide the static loading indicator once React mounts
const loadingEl = document.getElementById('app-loading');
if (loadingEl) loadingEl.style.display = 'none';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace' }}>
          <h1 style={{ color: 'red' }}>Application Error</h1>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fef2f2', padding: 20, borderRadius: 8, border: '1px solid #fecaca' }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
