'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, Warning, X } from '@phosphor-icons/react';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'dark';

interface ToastOptions {
  type?: ToastType;
  timeout?: number;
  action?: { text: string; callback: (toast: { destroy: () => void }) => void };
  cancel?: string;
}

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  action?: { text: string; callback: (toast: { destroy: () => void }) => void };
  cancel?: string;
}

interface ToastContextType {
  createToast: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const createToast = useCallback((message: string, options?: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 11);
    const newToast: Toast = {
      id,
      message,
      type: options?.type || 'info',
      action: options?.action,
      cancel: options?.cancel,
    };

    setToasts((prev) => [...prev, newToast].slice(-3));

    if (options?.timeout !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, options?.timeout || 3000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ createToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
              className={`pointer-events-auto flex items-center justify-between p-4 min-w-[300px] max-w-md rounded-xl shadow-2xl glass-strong border-l-4 ${
                toast.type === 'success' ? 'border-l-green-500' :
                toast.type === 'error' ? 'border-l-red-500' :
                toast.type === 'warning' ? 'border-l-yellow-500' :
                'border-l-blue-500'
              }`}
            >
              <div className="flex items-center gap-3">
                {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                 {toast.type === 'warning' && <Warning className="w-5 h-5 text-yellow-500" weight="fill" />}
                 {(toast.type === 'info' || toast.type === 'dark') && <Info className="w-5 h-5 text-blue-500" weight="fill" />}
                <p className="text-sm font-medium text-white">{toast.message}</p>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                {toast.cancel && (
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] hover:text-white transition-colors"
                  >
                    {toast.cancel}
                  </button>
                )}
                {toast.action && (
                  <button
                    onClick={() => toast.action!.callback({ destroy: () => removeToast(toast.id) })}
                    className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent-primary)] hover:text-white transition-colors"
                  >
                    {toast.action.text}
                  </button>
                )}
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-[var(--color-text-tertiary)] hover:text-white transition-colors"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
