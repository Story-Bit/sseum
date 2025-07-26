'use client';

import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: () => void;
}

const ICONS = {
  success: <CheckCircle className="mr-3" />,
  error: <AlertTriangle className="mr-3" />,
  info: <Info className="mr-3" />,
};

const TYPE_CLASSES = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
};

const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`fixed top-5 right-5 text-white py-3 px-5 rounded-lg shadow-lg flex items-center z-50 animate-fade-in-down ${TYPE_CLASSES[type]}`}>
      {ICONS[type]}
      <span className="font-semibold">{message}</span>
      <button onClick={onDismiss} className="ml-4 -mr-2 p-1 rounded-full hover:bg-white/20">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;