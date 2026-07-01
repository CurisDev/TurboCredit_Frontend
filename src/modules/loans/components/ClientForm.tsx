import { User, UserCheck } from 'lucide-react';
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
        <UserCheck className="text-primary" style={{ width: '20px', height: '20px' }} />
        2. Datos del Cliente
      </h2>

      <div className="grid grid-cols-3 gap-4">
        <Input
          id="client-name"
          label="Nombre del Cliente"
          type="text"
          value={inputs.clientName}
          onChange={(e) => onChangeInputs(prev => ({ ...prev, clientName: e.target.value }))}
          icon={<User style={{ width: '20px', height: '20px' }} />}
        />
        <Input
          id="client-dni"
          label="DNI del Cliente"
          type="text"
          maxLength={8}
          value={inputs.clientDni}
          onChange={(e) => onChangeInputs(prev => ({ ...prev, clientDni: e.target.value.replace(/\D/g, '') }))}
          placeholder="12345678"
          icon={<User style={{ width: '20px', height: '20px' }} />}
        />
        <Input
          id="client-income"
          label="Ingreso Mensual (S/.)"
          type="number"
          min={1}
          value={inputs.monthlyIncome}
          onChange={(e) => onChangeInputs(prev => ({ ...prev, monthlyIncome: Number(e.target.value) }))}
          placeholder="6500"
          icon={<span className="font-bold text-sm">S/.</span>}
        />
      </div>
    </Card>
  );
}
