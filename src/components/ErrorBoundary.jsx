import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          background: '#090d16',
          color: '#f8fafc',
          padding: '40px',
          fontFamily: 'sans-serif',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '12px', color: '#ff4d6d' }}>
            Application Error
          </h1>
          <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
            The app encountered an error on startup.
          </p>
          <pre style={{
            background: '#121826',
            border: '1px solid rgba(255,77,109,0.3)',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '0.8rem',
            color: '#ff4d6d',
            textAlign: 'left',
            maxWidth: '700px',
            width: '100%',
            overflow: 'auto',
            whiteSpace: 'pre-wrap'
          }}>
            {this.state.error?.toString()}
            {'\n\n'}
            {this.state.errorInfo?.componentStack}
          </pre>
          <button
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{
              marginTop: '20px',
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #00e699, #00b377)',
              color: '#031710',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            Clear Cache &amp; Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
