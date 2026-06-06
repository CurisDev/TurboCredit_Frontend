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
    <div className="grid grid-cols-5 gap-3">
      {/* TCEA */}
      <div className="m-card indigo flex flex-col justify-between shadow-lg">
        <span className="text-outline uppercase font-bold" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
          TCEA Anual
        </span>
        <span className="text-headline-md text-indigo-400 mt-2 font-bold" style={{ fontSize: '1.5rem' }}>
          {fmtPercent(results.tcea)}
        </span>
        <span className="text-outline mt-1" style={{ fontSize: '9px' }}>
          Costo real del crédito
        </span>
      </div>

      {/* VAN */}
      <div className="m-card emerald flex flex-col justify-between shadow-lg">
        <span className="text-outline uppercase font-bold" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
          VAN (Neto)
        </span>
        <span className="text-headline-md text-emerald-400 mt-2 font-bold" style={{ fontSize: '1.3rem' }}>
          {fmtCurrency(results.npv)}
        </span>
        <span className="text-outline mt-1" style={{ fontSize: '9px' }}>
          Descontado a COK
        </span>
      </div>

      {/* TIR */}
      <div className="m-card yellow flex flex-col justify-between shadow-lg">
        <span className="text-outline uppercase font-bold" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
          TIR Mensual
        </span>
        <span className="text-headline-md text-warning-yellow mt-2 font-bold" style={{ fontSize: '1.3rem' }}>
          {fmtPercent(results.irr)}
        </span>
        <span className="text-outline mt-1" style={{ fontSize: '9px' }}>
          Tasa interna retorno
        </span>
      </div>

      {/* Intereses */}
      <div className="m-card rose flex flex-col justify-between shadow-lg">
        <span className="text-outline uppercase font-bold" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
          Intereses Tot.
        </span>
        <span className="text-headline-md text-rose-400 mt-2 font-bold" style={{ fontSize: '1.3rem' }}>
          {fmtCurrency(results.totalInterestPaid)}
        </span>
        <span className="text-outline mt-1" style={{ fontSize: '9px' }}>
          Solo intereses
        </span>
      </div>

      {/* Total Pago */}
      <div className="m-card teal flex flex-col justify-between shadow-lg">
        <span className="text-outline uppercase font-bold" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
          Total Pago
        </span>
        <span className="text-headline-md text-white mt-2 font-bold" style={{ fontSize: '1.3rem' }}>
          {fmtCurrency(results.totalPaid)}
        </span>
        <span className="text-outline mt-1" style={{ fontSize: '9px' }}>
          Cuota + Seguros + Gastos
        </span>
      </div>
    </div>
  );
}
