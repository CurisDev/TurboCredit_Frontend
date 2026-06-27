import { Calendar, AlertCircle, Sparkles } from 'lucide-react';
import type { SimulatorResult } from '../domain/models';

interface ScheduleTableProps {
  results: SimulatorResult;
  termMonths: number;
  gracePeriodMonths: number;
  residualPercentage: number;
}

export function ScheduleTable({ 
  results, 
  termMonths, 
  gracePeriodMonths, 
  residualPercentage 
}: ScheduleTableProps) {
  
  const fmtCurrency = (val: number) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(val);
  };

  return (
    <div className="bg-slate-900/60 border-white/10 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden">
      <div className="px-6 py-4 border-white/5 flex items-center justify-between bg-slate-900/20" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <h2 className="text-body-md text-white flex items-center gap-2 m-0" style={{ fontWeight: 'bold' }}>
          <Calendar className="w-5 h-5 text-indigo-400" />
          Cronograma de Pagos Detallado (Plan Calendario)
        </h2>
        <span className="text-outline bg-white/5 border-white/10 px-4 py-2 rounded-full bold" style={{ fontSize: '0.75rem' }}>
          Cuota Fija: {fmtCurrency(results.fixedInstallment)}
        </span>
      </div>

      <div className="table-viewport">
        <table className="payment-table">
          <thead>
            <tr>
              <th className="text-center" style={{ width: '60px' }}>Nº</th>
              <th>Vencimiento</th>
              <th className="text-right">Saldo Inicial</th>
              <th className="text-right">Interés</th>
              <th className="text-right">Amortización</th>
              <th className="text-right">Cuota Base</th>
              <th className="text-right">Desgravamen</th>
              <th className="text-right">Seg. Vehic.</th>
              <th className="text-right">Gastos Fijos</th>
              <th className="text-right">Cuota Total</th>
              <th className="text-right">Saldo Final</th>
            </tr>
          </thead>
          <tbody>
            {results.schedule.map((item) => (
              <tr 
                key={item.period} 
                className={
                  item.isGracePeriod 
                    ? 'bg-grace' 
                    : item.period === termMonths 
                      ? 'bg-residual' 
                      : ''
                }
              >
                <td className="text-center bold">{item.period}</td>
                <td className="text-outline">{item.dueDate}</td>
                <td className="text-right">{fmtCurrency(item.beginningBalance)}</td>
                <td className="text-right text-rose-400">+{fmtCurrency(item.interest)}</td>
                <td className="text-right text-emerald-400">-{fmtCurrency(item.amortization)}</td>
                <td className="text-right text-white bold">
                  {fmtCurrency(item.installment)}
                </td>
                <td className="text-right text-outline">{fmtCurrency(item.lifeInsurance)}</td>
                <td className="text-right text-outline">{fmtCurrency(item.vehicularInsurance)}</td>
                <td className="text-right text-outline">
                  {fmtCurrency(item.portes)}
                </td>
                <td className="text-right">
                  <span className="rounded-md inline-block px-2 py-1 border border-white/10" style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {fmtCurrency(item.totalInstallment)}
                  </span>
                </td>
                <td className="text-right text-white bold">
                  {item.period === termMonths ? (
                    <span className="text-secondary bold">Cancelado</span>
                  ) : (
                    fmtCurrency(item.remainingBalance)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {gracePeriodMonths > 0 && (
        <div className="px-6 py-4 bg-slate-900/20 text-warning-yellow border-white/5 flex gap-2 items-center" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.75rem' }}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            Los periodos en amarillo corresponden a meses de **Gracia Total**. El interés se capitaliza al saldo. Solo se cobran los seguros y portes mensuales correspondientes.
          </span>
        </div>
      )}
      
      {results.residualValue > 0 && (
        <div className="px-6 py-4 bg-slate-900/20 text-indigo-300 border-white/5 flex gap-2 items-center" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.75rem' }}>
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>
            Modalidad **Compra Inteligente**: El mes final incluye el pago residual de **{fmtCurrency(results.residualValue)}** ({residualPercentage}%) cancelando la deuda completa.
          </span>
        </div>
      )}
    </div>
  );
}
