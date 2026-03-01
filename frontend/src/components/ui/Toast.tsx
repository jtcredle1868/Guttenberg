import React, { useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

const iconMap = {
  success: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
  error: <ExclamationCircleIcon className="w-5 h-5 text-red-500" />,
  info: <InformationCircleIcon className="w-5 h-5 text-blue-500" />,
  warning: <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />,
};

const colorMap = {
  success: 'border-green-200 bg-green-50',
  error: 'border-red-200 bg-red-50',
  info: 'border-blue-200 bg-blue-50',
  warning: 'border-amber-200 bg-amber-50',
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => (
        <div key={toast.id} className={clsx('flex items-start gap-3 p-4 rounded-xl border shadow-lg', colorMap[toast.type])}>
          {iconMap[toast.type]}
          <p className="text-sm text-gray-700 flex-1">{toast.message}</p>
          <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600">
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
    error: useCallback((msg: string) => addToast('error', msg), [addToast]),
    info: useCallback((msg: string) => addToast('info', msg), [addToast]),
    warning: useCallback((msg: string) => addToast('warning', msg), [addToast]),
  };
};
