import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('RootErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FBF9F5] text-[#18224B] flex items-center justify-center p-6">
          <div className="max-w-md w-full border border-[#18224B]/15 bg-white p-8 space-y-4 shadow-xl">
            <span className="font-brand text-2xl tracking-[0.06em] text-[#18224B] block">NOVA Sanctuary</span>
            <h2 className="font-serif-editorial text-2xl font-light text-[#18224B]">We are restoring your consultation view.</h2>
            <p className="font-basel text-xs text-[#18224B]/70 leading-relaxed">
              An unexpected display glitch occurred. Please click below to return to the sanctuary experience.
            </p>
            <button
              type="button"
              onClick={() => { window.location.href = '/'; }}
              className="w-full py-3 bg-[#18224B] text-white font-basel text-xs uppercase tracking-[0.14em] cursor-pointer hover:bg-[#233168] transition-colors"
            >
              Reload Experience
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
