"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
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
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

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
    <ToastContext.Provider value={{ toast, confirm }}>
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
            typeClass = "border-blue-100 bg-blue-50/95 text-blue-950 dark:border-blue-900/30 dark:bg-blue-950/95 dark:text-blue-100";
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
                className="w-full sm:w-auto"
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmSubmit}
                className="w-full sm:w-auto"
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
