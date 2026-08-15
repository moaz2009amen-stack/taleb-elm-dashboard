import { createContext, useCallback, useContext, useState } from 'react';

/* ============ Toast (بديل عصري لـ alert) ============ */
const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, variant = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center w-full px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-riseIn shadow-card border-2 rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2 ${
              t.variant === 'error'
                ? 'bg-coral text-white border-coral'
                : 'bg-ink text-parchment border-ink'
            }`}
          >
            <span>{t.variant === 'error' ? '⚑' : '✓'}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast لازم يتستخدم جوه ToastProvider');
  return ctx;
}

/* ============ Confirm Dialog (بديل عصري لـ window.confirm) ============ */
const ConfirmCtx = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null); // { message, resolve, danger }

  const confirm = useCallback((message, opts = {}) => {
    return new Promise((resolve) => {
      setState({ message, resolve, danger: opts.danger, confirmLabel: opts.confirmLabel || 'تأكيد' });
    });
  }, []);

  const close = (result) => {
    state?.resolve(result);
    setState(null);
  };

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-ink/40 backdrop-blur-[2px] px-4">
          <div className="card p-6 w-full max-w-sm animate-riseIn">
            <p className="font-semibold text-inktext mb-5 leading-relaxed">{state.message}</p>
            <div className="flex gap-2 justify-end">
              <button className="btn-ghost" onClick={() => close(false)}>إلغاء</button>
              <button
                className={state.danger ? 'btn-danger' : 'btn-primary'}
                onClick={() => close(true)}
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error('useConfirm لازم يتستخدم جوه ConfirmProvider');
  return ctx;
}

/* ============ عناصر مشتركة ============ */

export function Stamp({ children, tone = 'ink' }) {
  const toneClass = {
    ink: 'text-ink',
    coral: 'text-coral',
    forest: 'text-forest',
    gold: 'text-gold-dark',
  }[tone];
  return <span className={`stamp ${toneClass}`}>{children}</span>;
}

export function PageHeader({ eyebrow, title, action }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-7 flex-wrap">
      <div>
        {eyebrow && (
          <p className="font-messiri text-gold-dark text-sm font-semibold tracking-wide mb-1">{eyebrow}</p>
        )}
        <h2 className="font-messiri text-2xl md:text-3xl font-bold text-inktext">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon = '◇', title, hint }) {
  return (
    <div className="card p-10 text-center">
      <div className="w-12 h-12 mx-auto rounded-full bg-parchment flex items-center justify-center text-xl mb-3">{icon}</div>
      <p className="font-semibold text-inktext">{title}</p>
      {hint && <p className="text-sm text-muted mt-1">{hint}</p>}
    </div>
  );
}

export function Spinner({ label = 'جارِ التحميل...' }) {
  return (
    <div className="flex items-center gap-3 text-muted py-10 justify-center">
      <span className="w-4 h-4 rounded-full border-2 border-ink/20 border-t-ink animate-spin" />
      {label}
    </div>
  );
}
