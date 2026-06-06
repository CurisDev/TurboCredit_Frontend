import type { SimulatorResult } from '../domain/models';

interface MetricsPanelProps {
  results: SimulatorResult;
}

export function MetricsPanel({ results }: MetricsPanelProps) {
  const fmtCurrency = (val: number) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(val);
  };

  const fmtPercent = (val: number) => {
    return new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(val) + '%';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {/* TCEA */}
      <div className="bg-slate-900/60 border border-indigo-500/30 backdrop-blur-md p-4 rounded-2xl flex flex-col justify-between shadow-lg shadow-indigo-950/20">
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
          TCEA Anual
        </span>
        <span className="text-2xl font-black text-indigo-400 mt-2">
          {fmtPercent(results.tcea)}
        </span>
        <span className="text-[9px] text-slate-500 mt-1">
          Costo real del crédito
        </span>
      </div>

      {/* VAN */}
      <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md p-4 rounded-2xl flex flex-col justify-between shadow-lg">
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
          VAN (Neto)
        </span>
        <span className="text-xl font-black text-emerald-400 mt-2">
          {fmtCurrency(results.npv)}
        </span>
        <span className="text-[9px] text-slate-500 mt-1">
          Descontado a COK
        </span>
      </div>

      {/* TIR */}
      <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md p-4 rounded-2xl flex flex-col justify-between shadow-lg">
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
          TIR Mensual
        </span>
        <span className="text-xl font-black text-amber-400 mt-2">
          {fmtPercent(results.irr)}
        </span>
        <span className="text-[9px] text-slate-500 mt-1">
          Tasa interna retorno
        </span>
      </div>

      {/* Intereses */}
      <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md p-4 rounded-2xl flex flex-col justify-between shadow-lg">
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
          Intereses Tot.
        </span>
        <span className="text-xl font-black text-rose-400 mt-2">
          {fmtCurrency(results.totalInterestPaid)}
        </span>
        <span className="text-[9px] text-slate-500 mt-1">
          Solo intereses
        </span>
      </div>

      {/* Total Pago */}
      <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md p-4 rounded-2xl flex flex-col justify-between shadow-lg col-span-2 md:col-span-1">
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
          Total Pago
        </span>
        <span className="text-xl font-black text-white mt-2">
          {fmtCurrency(results.totalPaid)}
        </span>
        <span className="text-[9px] text-slate-500 mt-1">
          Cuota + Seguros + Gastos
        </span>
      </div>
    </div>
  );
}
