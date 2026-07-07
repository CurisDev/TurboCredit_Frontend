import { UserRound } from 'lucide-react';
import { Card } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import type { SimulatorInputs } from '../domain/models';

interface ClientFormProps {
  inputs: SimulatorInputs;
  onChangeInputs: (updater: (prev: SimulatorInputs) => SimulatorInputs) => void;
}

export function ClientForm({ inputs, onChangeInputs }: ClientFormProps) {
  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-headline-md text-white flex items-center gap-2" style={{ fontSize: '1.25rem' }}>
        <UserRound className="text-primary" style={{ width: '20px', height: '20px' }} />
        4. Datos del Cliente
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="client-name"
          label="Nombre del Cliente"
          type="text"
          value={inputs.clientName}
          onChange={(e) => onChangeInputs(prev => ({ ...prev, clientName: e.target.value }))}
          placeholder="Nombre y apellido"
        />

        <Input
          id="cok-value"
          label="COK Anual (%)"
          type="number"
          step="0.1"
          value={inputs.cok}
          onChange={(e) => onChangeInputs(prev => ({ ...prev, cok: Number(e.target.value) }))}
        />
      </div>

      <p className="text-outline text-xs">
        El COK (Costo de Oportunidad del Capital) es un dato del cliente. El banco no lo cobra;
        se usa para calcular el VAN (VPN) del crédito desde la perspectiva del cliente.
      </p>
    </Card>
  );
}
