"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ConfirmConfig {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ToastContextType {
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
  };
  confirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  showAlert: (title: string, message: string, type?: "success" | "error", onClose?: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState<{ show: boolean; message?: string }>({ show: false });
  const [alertConfig, setAlertConfig] = useState<{ title: string; message: string; type: "success" | "error"; onClose?: () => void } | null>(null);

  const addToast = useCallback((message: string, type: ToastType, duration = 3500) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useMemo(
    () => ({
      success: (msg: string, dur?: number) => addToast(msg, "success", dur),
      error: (msg: string, dur?: number) => addToast(msg, "error", dur),
      info: (msg: string, dur?: number) => addToast(msg, "info", dur),
      warning: (msg: string, dur?: number) => addToast(msg, "warning", dur),
    }),
    [addToast]
  );

  const confirm = useCallback(
    (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => {
      setConfirmConfig({ title, message, onConfirm, onCancel });
    },
    []
  );

  const showLoading = useCallback((message = "Đang xử lý dữ liệu...") => {
    setLoadingConfig({ show: true, message });
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingConfig({ show: false });
  }, []);

  const showAlert = useCallback((title: string, message: string, type: "success" | "error" = "success", onClose?: () => void) => {
    setAlertConfig({ title, message, type, onClose });
  }, []);

  const handleConfirmClose = () => {
    if (confirmConfig?.onCancel) {
      confirmConfig.onCancel();
    }
    setConfirmConfig(null);
  };

  const handleConfirmSubmit = () => {
    if (confirmConfig) {
      confirmConfig.onConfirm();
    }
    setConfirmConfig(null);
  };

  return (
    <ToastContext.Provider value={{ toast, confirm, showLoading, hideLoading, showAlert }}>
      {children}

      {/* Floating Toast Notification Stack Container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2.5 w-full max-w-sm px-4 sm:px-0 pointer-events-none">
        {toasts.map((item) => {
          let typeClass = "";
          let Icon = Info;

          if (item.type === "success") {
            typeClass = "border-emerald-100 bg-emerald-50/95 text-emerald-950 dark:border-emerald-900/30 dark:bg-emerald-950/95 dark:text-emerald-100";
            Icon = CheckCircle2;
          } else if (item.type === "error") {
            typeClass = "border-rose-100 bg-rose-50/95 text-rose-955 dark:border-rose-900/30 dark:bg-rose-950/95 dark:text-rose-100";
            Icon = AlertCircle;
          } else if (item.type === "warning") {
            typeClass = "border-amber-100 bg-amber-50/95 text-amber-955 dark:border-amber-900/30 dark:bg-amber-950/95 dark:text-amber-100";
            Icon = AlertTriangle;
          } else {
            typeClass = "border-blue-100 bg-blue-50/95 text-blue-955 dark:border-blue-900/30 dark:bg-blue-950/95 dark:text-blue-100";
            Icon = Info;
          }

          return (
            <div
              key={item.id}
              className={`pointer-events-auto flex items-start gap-3 w-full p-4 rounded-xl border backdrop-blur-md shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${typeClass}`}
              role="alert"
            >
              <Icon className="size-4 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm font-medium leading-relaxed break-words pr-2">
                {item.message}
              </div>
              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="ml-auto shrink-0 p-0.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity hover:bg-black/5 dark:hover:bg-white/5"
                aria-label="Đóng"
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Global Loading Overlay */}
      {loadingConfig.show && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950/50 backdrop-blur-[3px] transition-all duration-300 animate-in fade-in">
          <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/95 dark:bg-slate-900/95 shadow-2xl border border-slate-100 dark:border-slate-800/50 max-w-xs text-center scale-95 animate-in zoom-in-95 duration-250">
            <div className="relative flex items-center justify-center">
              <div className="size-12 rounded-full border-4 border-primary/20 animate-pulse" />
              <Loader2 className="absolute size-6 animate-spin text-primary" />
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-wide animate-pulse">
              {loadingConfig.message}
            </p>
          </div>
        </div>
      )}

      {/* Global Alert Modal (Center screen notification) */}
      {alertConfig && (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-slate-950/50 backdrop-blur-[3px] p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800/80 overflow-hidden scale-95 animate-in zoom-in-95 duration-250 flex flex-col items-center p-6 text-center">
            
            {/* Animated Big Icon */}
            <div className={`flex size-16 items-center justify-center rounded-full mb-4 ${
              alertConfig.type === "success" 
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500" 
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-500"
            }`}>
              {alertConfig.type === "success" ? (
                <CheckCircle2 className="size-9 animate-bounce duration-1000" />
              ) : (
                <AlertTriangle className="size-9 animate-pulse" />
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {alertConfig.title}
            </h3>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed max-w-xs">
              {alertConfig.message}
            </p>

            <button
              type="button"
              onClick={() => {
                const handler = alertConfig.onClose;
                setAlertConfig(null);
                if (handler) handler();
              }}
              className={`mt-6 w-full py-2.5 px-5 rounded-xl font-semibold text-sm transition-all shadow-md active:scale-98 cursor-pointer ${
                alertConfig.type === "success"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-550/10"
                  : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-550/10"
              }`}
            >
              Hoàn tất
            </button>
          </div>
        </div>
      )}

      {/* Premium custom confirmation modal */}
      {confirmConfig && (
        <Dialog open={true} onOpenChange={handleConfirmClose}>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle className="text-slate-800 dark:text-slate-100">
                {confirmConfig.title}
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 mt-2 text-xs sm:text-sm leading-relaxed">
                {confirmConfig.message}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleConfirmClose}
                className="w-full sm:w-auto font-medium"
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmSubmit}
                className="w-full sm:w-auto font-medium"
              >
                Xác nhận
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
