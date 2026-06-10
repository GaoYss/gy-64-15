import { X, CheckCircle, XCircle, Info } from "lucide-react";

import { useAppData } from "../context/AppContext.jsx";

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

export function Toast() {
  const { toasts, hideToast } = useAppData();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-stack">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] || ICONS.info;
        return (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <Icon size={18} />
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" type="button" onClick={() => hideToast(toast.id)} aria-label="Close">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
