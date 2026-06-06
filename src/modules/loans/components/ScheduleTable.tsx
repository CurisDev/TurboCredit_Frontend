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
    <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-slate-900/20">
        <h2 className="text-base font-bold text-white flex items-center gap-2 m-0">
          <Calendar className="w-5 h-5 text-indigo-400" />
          Cronograma de Pagos Detallado (Plan Calendario)
        </h2>
        <span className="text-xs text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full font-bold">
          Cuota Fija: {fmtCurrency(results.fixedInstallment)}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/20">
              <th className="py-3 px-4 text-center">Nº</th>
              <th className="py-3 px-4">Vencimiento</th>
              <th className="py-3 px-4 text-right">Saldo Inicial</th>
              <th className="py-3 px-4 text-right">Interés</th>
              <th className="py-3 px-4 text-right">Amortización</th>
              <th className="py-3 px-4 text-right">Cuota Base</th>
              <th className="py-3 px-4 text-right">Desgravamen</th>
              <th className="py-3 px-4 text-right">Seg. Vehic.</th>
              <th className="py-3 px-4 text-right">Gastos Fijos</th>
              <th className="py-3 px-4 text-right">Cuota Total</th>
              <th className="py-3 px-4 text-right">Saldo Final</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {results.schedule.map((item) => (
              <tr 
                key={item.period} 
                className={`hover:bg-white/5 transition-colors duration-150 ${
                  item.isGracePeriod 
                    ? 'bg-amber-500/5 text-amber-300/90' 
                    : item.period === termMonths 
                      ? 'bg-indigo-500/5 font-semibold text-indigo-250' 
                      : ''
                }`}
              >
                <td className="py-3.5 px-4 text-center font-black">{item.period}</td>
                <td className="py-3.5 px-4 text-slate-400">{item.dueDate}</td>
                <td className="py-3.5 px-4 text-right font-medium">{fmtCurrency(item.beginningBalance)}</td>
                <td className="py-3.5 px-4 text-right text-rose-400/90 font-medium">+{fmtCurrency(item.interest)}</td>
                <td className="py-3.5 px-4 text-right text-emerald-400/90">-{fmtCurrency(item.amortization)}</td>
                <td className="py-3.5 px-4 text-right font-extrabold text-white">
                  {fmtCurrency(item.installment)}
                </td>
                <td className="py-3.5 px-4 text-right text-slate-400">{fmtCurrency(item.lifeInsurance)}</td>
                <td className="py-3.5 px-4 text-right text-slate-400">{fmtCurrency(item.vehicularInsurance)}</td>
                <td className="py-3.5 px-4 text-right text-slate-400">
                  {fmtCurrency(item.portes + item.administrationFee)}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-black ${
                    item.isGracePeriod 
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/25' 
                      : item.period === termMonths
                        ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
                        : 'bg-white/5 text-white'
                  }`}>
                    {fmtCurrency(item.totalInstallment)}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right font-bold text-white">
                  {item.period === termMonths ? (
                    <span className="text-emerald-400 font-extrabold">Cancelado</span>
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
        <div className="px-6 py-4 bg-amber-500/5 text-xs text-amber-400/90 border-t border-white/5 flex gap-2 items-center">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            Los periodos en amarillo corresponden a meses de **Gracia Total**. El interés se capitaliza al saldo. Solo se cobran los seguros y portes mensuales correspondientes.
          </span>
        </div>
      )}
      
      {results.residualValue > 0 && (
        <div className="px-6 py-4 bg-indigo-500/5 text-xs text-indigo-300 border-t border-white/5 flex gap-2 items-center">
          <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
          <span>
            Modalidad **Compra Inteligente**: El mes final incluye el pago residual de **{fmtCurrency(results.residualValue)}** ({residualPercentage}%) cancelando la deuda completa.
          </span>
        </div>
      )}
    </div>
  );
}
