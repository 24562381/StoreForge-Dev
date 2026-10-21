'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X,
  HelpCircle
} from 'lucide-react';

export type ModalType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface ModalOptions {
  title?: string;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger' | 'success';
}

interface ModalState {
  isOpen: boolean;
  message: string;
  title: string;
  type: ModalType;
  confirmText: string;
  cancelText: string;
  confirmVariant: 'primary' | 'danger' | 'success';
  isConfirm: boolean;
}

interface AdminModalContextType {
  showAlert: (message: string, options?: ModalOptions) => Promise<void>;
  showSuccess: (message: string, title?: string) => Promise<void>;
  showError: (message: string, title?: string) => Promise<void>;
  showWarning: (message: string, title?: string) => Promise<void>;
  showConfirm: (message: string, options?: ModalOptions) => Promise<boolean>;
}

const AdminModalContext = createContext<AdminModalContextType | undefined>(undefined);

export function AdminModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    message: '',
    title: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: 'Cancel',
    confirmVariant: 'primary',
    isConfirm: false,
  });

  const resolverRef = useRef<((value: any) => void) | null>(null);

  const showAlert = useCallback((message: string, options?: ModalOptions): Promise<void> => {
    return new Promise((resolve) => {
      resolverRef.current = () => resolve();
      setModal({
        isOpen: true,
        message,
        title: options?.title || (
          options?.type === 'success' ? 'Success' :
          options?.type === 'error' ? 'Error' :
          options?.type === 'warning' ? 'Notice' : 'Information'
        ),
        type: options?.type || 'info',
        confirmText: options?.confirmText || 'OK',
        cancelText: '',
        confirmVariant: options?.confirmVariant || (options?.type === 'error' ? 'danger' : 'primary'),
        isConfirm: false,
      });
    });
  }, []);

  const showSuccess = useCallback((message: string, title: string = 'Success') => {
    return showAlert(message, { title, type: 'success' });
  }, [showAlert]);

  const showError = useCallback((message: string, title: string = 'Error Occurred') => {
    return showAlert(message, { title, type: 'error', confirmVariant: 'danger' });
  }, [showAlert]);

  const showWarning = useCallback((message: string, title: string = 'Attention Required') => {
    return showAlert(message, { title, type: 'warning' });
  }, [showAlert]);

  const showConfirm = useCallback((message: string, options?: ModalOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverRef.current = (result: boolean) => resolve(result);
      setModal({
        isOpen: true,
        message,
        title: options?.title || 'Confirmation',
        type: options?.type || 'warning',
        confirmText: options?.confirmText || 'Confirm',
        cancelText: options?.cancelText || 'Cancel',
        confirmVariant: options?.confirmVariant || (options?.type === 'warning' || options?.type === 'error' ? 'danger' : 'primary'),
        isConfirm: true,
      });
    });
  }, []);

  const handleConfirm = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  };

  const handleCancel = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  };

  const renderIcon = () => {
    switch (modal.type) {
      case 'success':
        return (
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        );
      case 'error':
        return (
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center ring-8 ring-rose-50/50">
            <AlertCircle className="w-6 h-6" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center ring-8 ring-amber-50/50">
            <AlertTriangle className="w-6 h-6" />
          </div>
        );
      case 'confirm':
        return (
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center ring-8 ring-indigo-50/50">
            <HelpCircle className="w-6 h-6" />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center ring-8 ring-blue-50/50">
            <Info className="w-6 h-6" />
          </div>
        );
    }
  };

  const contextValue = React.useMemo(
    () => ({ showAlert, showSuccess, showError, showWarning, showConfirm }),
    [showAlert, showSuccess, showError, showWarning, showConfirm],
  );

  return (
    <AdminModalContext.Provider value={contextValue}>
      {children}

      {/* Common Modal Popup */}
      {modal.isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={handleCancel}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden scale-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="p-5 sm:p-6 pb-0 flex items-start justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3.5">
                {renderIcon()}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    {modal.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line p-5 sm:p-6 overflow-y-auto flex-1">
              {modal.message}
            </div>

            <div className="p-4 sm:p-5 sm:px-6 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-3 shrink-0">
              {modal.isConfirm && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-all shadow-sm cursor-pointer"
                >
                  {modal.cancelText || 'Cancel'}
                </button>
              )}
              <button
                type="button"
                onClick={handleConfirm}
                autoFocus
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm text-white cursor-pointer ${
                  modal.confirmVariant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    : modal.confirmVariant === 'success'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : 'bg-[#c08a46] hover:bg-[#a87435] shadow-amber-500/20'
                }`}
                style={{
                  backgroundColor:
                    modal.confirmVariant === 'danger'
                      ? '#e11d48'
                      : modal.confirmVariant === 'success'
                      ? '#059669'
                      : '#c08a46',
                  color: '#ffffff',
                }}
              >
                {modal.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminModalContext.Provider>
  );
}

export function useAdminModal() {
  const context = useContext(AdminModalContext);
  if (!context) {
    return {
      showAlert: async (msg: string) => { window.alert(msg); },
      showSuccess: async (msg: string) => { window.alert(msg); },
      showError: async (msg: string) => { window.alert(msg); },
      showWarning: async (msg: string) => { window.alert(msg); },
      showConfirm: async (msg: string) => window.confirm(msg),
    };
  }
  return context;
}
