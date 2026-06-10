import { X, CheckCircle, XCircle, Info } from "lucide-react";

import { useAppData } from "../context/AppContext.jsx";

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

export function Toast() {
  const { toast, hideToast } = useAppData();

  if (!toast) return null;

  const Icon = ICONS[toast.type] || ICONS.info;

  return (
    <div className={`toast toast-${toast.type}`}>
      <Icon size={18} />
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" type="button" onClick={hideToast} aria-label="Close">
        <X size={16} />
      </button>
    </div>
  );
}
