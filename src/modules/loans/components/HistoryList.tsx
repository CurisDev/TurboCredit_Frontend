import { History } from 'lucide-react';
import { Card } from '../../../shared/components/Card';

interface HistoryListProps {
  history: any[];
  selectedHistoryId: number | null;
  onSelectHistory: (sim: any) => void;
}

export function HistoryList({ history, selectedHistoryId, onSelectHistory }: HistoryListProps) {
  
  const fmtPercent = (val: number) => {
    return new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(val) + '%';
  };

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <History className="w-5 h-5 text-indigo-400" />
        Historial de Simulaciones
      </h2>
      <p className="text-slate-400 text-xs">
        Simulaciones guardadas del usuario actual en la base de datos. Haz clic en una para ver sus detalles y recrear el cronograma.
      </p>

      {history.length === 0 ? (
        <div className="p-8 text-center text-slate-500 border border-dashed border-white/5 rounded-2xl">
          <span>No hay simulaciones guardadas aún. Realiza una y guárdala.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
          {history.map((sim: any) => (
            <button
              key={sim.id}
              type="button"
              onClick={() => onSelectHistory(sim)}
              className={`p-3 rounded-xl border text-left flex items-center justify-between hover:bg-slate-800/80 transition-all duration-200 ${
                selectedHistoryId === sim.id 
                  ? 'border-indigo-500 bg-indigo-500/10' 
                  : 'border-white/5 bg-slate-950/40'
              }`}
            >
              <div className="space-y-1">
                <span className="text-xs font-black text-white block">
                  {sim.vehicleBrand} {sim.vehicleModel}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Cliente: {sim.clientName}
                </span>
                <span className="text-[9px] text-slate-500 block">
                  Banco: {sim.bankName} • Plazo: {sim.termMonths} meses
                </span>
              </div>
              <div className="text-right pl-2 shrink-0">
                <span className="text-xs font-bold text-indigo-400 block">
                  {fmtPercent(sim.tcea)}
                </span>
                <span className="text-[9px] text-slate-400 block">
                  TCEA
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
