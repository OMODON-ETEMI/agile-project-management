"use client"

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: number;
  type: ToastType;
  title: string;
  description?: string;
}

export interface ToastContextType {
  showToast: (opts: {
    type?: ToastType;
    title: string;
    description?: string;
    duration?: number;
  }) => number;
  removeToast: (id: number) => void;
}

const VARIANT_STYLES: Record<ToastType, {
  container: string;
  icon: string;
  iconNode: ReactNode;
}> = {
  success: {
    container: 'bg-green-500 text-white',
    icon: 'text-white',
    iconNode: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
    ),
  },
  error: {
    container: 'bg-red-500 text-white',
    icon: 'text-white',
    iconNode: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
    ),
  },
  warning: {
    container: 'bg-yellow-400 text-black',
    icon: 'text-black',
    iconNode: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" /></svg>
    ),
  },
  info: {
    container: 'bg-slate-800 text-white',
    icon: 'text-white',
    iconNode: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" /></svg>
    ),
  },
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const removeToast = useCallback((id: number) => {
    setToasts((toasts) => toasts.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const showToast = useCallback(({
    type = 'info',
    title,
    description,
    duration = 3500,
  }: {
    type?: ToastType;
    title: string;
    description?: string;
    duration?: number;
  }): number => {
    const id = ++toastId;
    setToasts((toasts) => {
      const next = [{ id, type, title, description }, ...toasts].slice(0, 4);
      return next;
    });
    timers.current[id] = setTimeout(() => removeToast(id), duration);
    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed z-[9999] w-full max-w-sm md:w-[360px] md:top-4 md:right-4 md:left-auto md:bottom-auto top-auto right-auto left-4 bottom-4 pointer-events-none">
        {toasts.map((toast) => {
          const variant = VARIANT_STYLES[toast.type] || VARIANT_STYLES.info;
          return (
            <div
              key={toast.id}
              className={`mb-3 animate-fade-in-down ${variant.container} rounded-xl shadow-lg ring-1 ring-white/10 px-4 py-3 flex items-start gap-3 pointer-events-auto`}
              style={{ animationDuration: '300ms' }}
            >
              <span className={`mt-0.5 w-5 h-5 flex-shrink-0 ${variant.icon}`}>{variant.iconNode}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{toast.title}</div>
                {toast.description && <div className="text-sm text-white/90 mt-0.5">{toast.description}</div>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 text-lg opacity-70 hover:opacity-100 hover:text-white focus:outline-none"
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
