import { Car } from 'lucide-react';
import { Card } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import type { SimulatorInputs } from '../domain/models';

interface VehicleFormProps {
  inputs: SimulatorInputs;
  onChangeInputs: (updater: (prev: SimulatorInputs) => SimulatorInputs) => void;
}

export function VehicleForm({ inputs, onChangeInputs }: VehicleFormProps) {
  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-headline-md text-white flex items-center gap-2" style={{ fontSize: '1.25rem' }}>
        <Car className="text-primary" style={{ width: '20px', height: '20px' }} />
        3. Datos del Vehículo
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="vehicle-brand"
          label="Marca del Vehículo"
          type="text"
          value={inputs.vehicleBrand}
          onChange={(e) => onChangeInputs(prev => ({ ...prev, vehicleBrand: e.target.value }))}
          placeholder="Toyota, Hyundai..."
        />
        <Input
          id="vehicle-model"
          label="Modelo"
          type="text"
          value={inputs.vehicleModel}
          onChange={(e) => onChangeInputs(prev => ({ ...prev, vehicleModel: e.target.value }))}
          placeholder="Corolla, Tucson..."
        />
      </div>
    </Card>
  );
}
