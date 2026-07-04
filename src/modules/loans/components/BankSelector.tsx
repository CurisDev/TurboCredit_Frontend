import { Building, Sparkles } from 'lucide-react';
import { bankConfigurations } from '../../../data/bankConfigurations';
import { Card } from '../../../shared/components/Card';

interface BankSelectorProps {
  selectedBankId: string;
  onSelectBank: (id: string) => void;
}

export function BankSelector({ selectedBankId, onSelectBank }: BankSelectorProps) {
  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-headline-md text-white flex items-center gap-2" style={{ fontSize: '1.25rem' }}>
        <Building className="text-primary" style={{ width: '20px', height: '20px' }} />
        1. Selecciona una Entidad Financiera
      </h2>
      <p className="text-outline text-body-sm" style={{ fontSize: '0.8rem' }}>
        Los bancos peruanos cargan automáticamente sus tasas efectivas, seguros y comisiones promedio.
      </p>
      
      <div className="grid grid-cols-2 gap-4 pt-2">
        {bankConfigurations.map((bank) => (
          <button
            key={bank.id}
            type="button"
            onClick={() => onSelectBank(bank.id)}
            className={`btn-bank p-4 flex flex-col justify-between min-w-0 ${
                selectedBankId === bank.id ? 'active' : ''
            }`}
            style={{ height: '96px', textAlign: 'left', minWidth: 0 }}
          >
              <div className="flex justify-between items-center w-full min-w-0" style={{ gap: '6px' }}>
                  <span className="bold text-white" style={{ fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{bank.name}</span>
              {bank.id !== 'custom' && (
                  <span style={{ fontSize: '10px', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#dce1fb', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>
                  TEA: {(bank.config.tea * 100).toFixed(1)}%
                </span>
              )}
            </div>
            <span style={{ fontSize: '10px', color: '#908fa0', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {bank.fullName}
            </span>
          </button>
        ))}
      </div>

      {selectedBankId !== 'custom' && (
        <div className="p-4 flex flex-col gap-2 mt-2" style={{ background: 'rgba(7, 13, 31, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '0.75rem' }}>
          <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#8083ff', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
            Beneficios del Banco
          </span>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#dce1fb' }}>
            {bankConfigurations.find(b => b.id === selectedBankId)?.features.map((feat, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <Sparkles className="text-primary shrink-0" style={{ width: '14px', height: '14px' }} />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
