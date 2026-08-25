import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useWorkspace();

  if (!toastMessage) return null;

  const getIcon = () => {
    switch (toastMessage.type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-indigo-400 shrink-0" />;
    }
  };

  const getBg = () => {
    switch (toastMessage.type) {
      case 'success':
        return 'border-emerald-500/40 bg-slate-900 text-emerald-100 shadow-emerald-950/40';
      case 'warning':
        return 'border-amber-500/40 bg-slate-900 text-amber-100 shadow-amber-950/40';
      case 'error':
        return 'border-rose-500/40 bg-slate-900 text-rose-100 shadow-rose-950/40';
      default:
        return 'border-indigo-500/40 bg-slate-900 text-indigo-100 shadow-indigo-950/40';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl text-xs font-medium max-w-md ${getBg()}`}
      >
        {getIcon()}
        <span>{toastMessage.text}</span>
      </div>
    </div>
  );
};
