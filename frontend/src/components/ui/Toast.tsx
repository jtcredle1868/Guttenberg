import React, { useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import {
  XMarkIcon, CheckCircleIcon, ExclamationCircleIcon,
  InformationCircleIcon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const iconMap = {
  success: <CheckCircleIcon className="w-5 h-5 flex-shrink-0" style={{ color: '#34d399' }} />,
  error:   <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" style={{ color: '#f87171' }} />,
  info:    <InformationCircleIcon className="w-5 h-5 flex-shrink-0" style={{ color: '#8aafc8' }} />,
  warning: <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" style={{ color: '#d4af37' }} />,
};

const styleMap: Record<string, React.CSSProperties> = {
  success: {
    background: 'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
    border: '1px solid rgba(52,211,153,0.28)',
    boxShadow: '0 8px 32px rgba(5,13,26,0.55), 0 0 0 1px rgba(52,211,153,0.12)',
  },
  error: {
    background: 'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
    border: '1px solid rgba(248,113,113,0.30)',
    boxShadow: '0 8px 32px rgba(5,13,26,0.55), 0 0 0 1px rgba(248,113,113,0.10)',
  },
  info: {
    background: 'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
    border: '1px solid rgba(61,96,128,0.40)',
    boxShadow: '0 8px 32px rgba(5,13,26,0.55)',
  },
  warning: {
    background: 'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
    border: '1px solid rgba(212,175,55,0.30)',
    boxShadow: '0 8px 32px rgba(5,13,26,0.55), 0 0 0 1px rgba(212,175,55,0.10)',
  },
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="flex items-start gap-3 px-4 py-3.5 rounded-xl pointer-events-auto animate-slide-up"
          style={styleMap[toast.type]}
        >
          {iconMap[toast.type]}
          <p className="text-sm flex-1 leading-relaxed" style={{ color: '#c5d8e8', fontFamily: 'Inter, sans-serif' }}>
            {toast.message}
          </p>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-0.5 rounded-lg transition-colors flex-shrink-0 mt-0.5"
            style={{ color: 'rgba(90,127,160,0.55)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#c5d8e8')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(90,127,160,0.55)')}
            aria-label="Dismiss"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export const useToast = () => {
  const { addToast } = useApp();
  return {
    success: useCallback((msg: string) => addToast('success', msg), [addToast]),
    error:   useCallback((msg: string) => addToast('error',   msg), [addToast]),
    info:    useCallback((msg: string) => addToast('info',    msg), [addToast]),
    warning: useCallback((msg: string) => addToast('warning', msg), [addToast]),
  };
};
