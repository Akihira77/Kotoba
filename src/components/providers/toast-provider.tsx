"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cn, uid } from "@/lib/utils";
import { Icon } from "@/components/icons";

type Tone = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  tone: Tone;
}

interface ToastApi {
  push: (message: string, tone?: Tone) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast harus dipakai di dalam ToastProvider");
  return context;
}

const toneStyles: Record<Tone, string> = {
  success: "border-matcha/30 bg-surface text-ink",
  error: "border-red-500/30 bg-surface text-ink",
  info: "border-line bg-surface text-ink",
};

const toneIcons: Record<Tone, "checkCircle" | "xCircle" | "info"> = {
  success: "checkCircle",
  error: "xCircle",
  info: "info",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, tone: Tone = "info") => {
    const id = uid("toast");
    setToasts((current) => [...current.slice(-2), { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      push,
      success: (message) => push(message, "success"),
      error: (message) => push(message, "error"),
      info: (message) => push(message, "info"),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end" aria-live="polite" aria-atomic="false">
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className={cn(
              "animate-pop-in pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm shadow-lift",
              toneStyles[item.tone],
            )}
          >
            <Icon
              name={toneIcons[item.tone]}
              size={18}
              className={cn(
                "mt-0.5 shrink-0",
                item.tone === "success" ? "text-matcha" : item.tone === "error" ? "text-red-500" : "text-indigo",
              )}
            />
            <span className="flex-1 leading-snug">{item.message}</span>
            <button
              type="button"
              aria-label="Tutup notifikasi"
              onClick={() => setToasts((current) => current.filter((entry) => entry.id !== item.id))}
              className="rounded-full p-1 text-muted transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
