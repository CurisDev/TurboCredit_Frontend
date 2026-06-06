import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface AlertProps {
  children: React.ReactNode;
  type?: 'success' | 'error' | 'info';
  className?: string;
}

export function Alert({ children, type = 'info', className = '' }: AlertProps) {
  const styles = {
    success: 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400',
    error: 'bg-rose-950/30 border-rose-500/30 text-rose-400',
    info: 'bg-slate-900/60 border-white/10 text-slate-300',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
  };

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 text-sm transition-all duration-300 ${styles[type]} ${className}`}>
      {icons[type]}
      <div className="flex-1">{children}</div>
    </div>
  );
}
