import { Coins, Info } from 'lucide-react';
import { Card } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import type { SimulatorInputs } from '../domain/models';

interface FinancialFormProps {
  inputs: SimulatorInputs;
  onChangeInputs: (updater: (prev: SimulatorInputs) => SimulatorInputs) => void;
  onSelectCustomBank: () => void;
}

export function FinancialForm({ inputs, onChangeInputs, onSelectCustomBank }: FinancialFormProps) {
  const round = (val: number): number => Math.round(val * 100) / 100;

  const handlePriceChange = (price: number) => {
    const downAmount = round(price * (inputs.downPaymentPct / 100));
    onChangeInputs(prev => ({
      ...prev,
      vehiclePrice: price,
      downPayment: downAmount,
    }));
  };

  const handleDownPctChange = (pct: number) => {
    const downAmount = round(inputs.vehiclePrice * (pct / 100));
    onChangeInputs(prev => ({
      ...prev,
      downPaymentPct: pct,
      downPayment: downAmount,
    }));
  };

  const handleDownAmountChange = (amount: number) => {
    const pct = round((amount / inputs.vehiclePrice) * 100);
    onChangeInputs(prev => ({
      ...prev,
      downPaymentPct: pct,
      downPayment: amount,
    }));
  };

  const fmtCurrency = (val: number) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(val);
  };

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-headline-md text-white flex items-center gap-2" style={{ fontSize: '1.25rem' }}>
        <Coins className="text-primary" style={{ width: '20px', height: '20px' }} />
        3. Condiciones del Crédito
      </h2>

      {/* Precio y Cuota Inicial */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="vehicle-price"
          label="Precio del Vehículo (S/.)"
          type="number"
          min={1000}
          placeholder="Ej. 85000"
          value={inputs.vehiclePrice || ''}
          onChange={(e) => handlePriceChange(Number(e.target.value))}
          className="bold text-white"
        />
        <Input
          id="down-payment"
          label="Cuota Inicial (S/.)"
          type="number"
          min={0}
          max={inputs.vehiclePrice}
          placeholder="Ej. 17000"
          value={inputs.downPayment || ''}
          onChange={(e) => handleDownAmountChange(Number(e.target.value))}
          className="bold text-white"
        />
      </div>

      {/* Sliders de Cuota Inicial */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-body-sm text-outline">
          <span>Porcentaje de Cuota Inicial</span>
          <span className="bold text-primary">{inputs.downPaymentPct}%</span>
        </div>
        <input
          type="range"
          min={10}
          max={50}
          step={5}
          value={inputs.downPaymentPct}
          onChange={(e) => handleDownPctChange(Number(e.target.value))}
          className="cursor-pointer"
        />
      </div>

      {/* Slider de Cuota Final (Residual) */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-body-sm text-outline">
          <span className="flex items-center gap-1.5">
            Cuota Final / Residual (Último mes)
            <span title="Porcentaje del valor del auto a liquidar en la cuota final en la modalidad de Compra Inteligente." className="cursor-help flex items-center">
              <Info className="text-outline" style={{ width: '14px', height: '14px' }} />
            </span>
          </span>
          <span className="bold text-primary">
            {inputs.residualPercentage}% ({fmtCurrency(inputs.vehiclePrice * (inputs.residualPercentage / 100))})
          </span>
        </div>
        <input
          type="range"
          min={20}
          max={50}
          step={5}
          value={inputs.residualPercentage}
          onChange={(e) => {
            onChangeInputs(prev => ({ ...prev, residualPercentage: Number(e.target.value) }));
            onSelectCustomBank();
          }}
          className="cursor-pointer"
        />
      </div>

      {/* Fila Plazos e Interés */}
      <div className="grid grid-cols-3 gap-4">
        <div className="form-group">
          <label htmlFor="term-months" className="text-label-bold" style={{ fontSize: '11px' }}>
            Plazo (Meses)
          </label>
          <div className="luminous-input">
            <select
              id="term-months"
              value={inputs.termMonths}
              onChange={(e) => onChangeInputs(prev => ({ ...prev, termMonths: Number(e.target.value) }))}
              style={{ width: '100%' }}
            >
              <option value={24}>24 meses</option>
              <option value={36}>36 meses</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="grace-months" className="text-label-bold" style={{ fontSize: '11px' }}>
            Gracia Total
          </label>
          <div className="luminous-input">
            <select
              id="grace-months"
              value={inputs.gracePeriodMonths}
              onChange={(e) => onChangeInputs(prev => ({ ...prev, gracePeriodMonths: Number(e.target.value) }))}
              style={{ width: '100%' }}
            >
              <option value={0}>Sin gracia</option>
              <option value={1}>1 mes</option>
              <option value={2}>2 meses</option>
              <option value={3}>3 meses</option>
            </select>
          </div>
        </div>

        <Input
          id="interest-tea"
          label="TEA Anual (%)"
          type="number"
          step="0.01"
          value={inputs.tea}
          onChange={(e) => {
            onChangeInputs(prev => ({ ...prev, tea: Number(e.target.value) }));
            onSelectCustomBank();
          }}
        />
      </div>

      {/* SECCIÓN DETALLES AVANZADOS (SEGUROS Y COMISIONES) */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.25rem' }} className="flex flex-col gap-4">
        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#8083ff', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
          Costos Adicionales (SBS Transparencia)
        </span>

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="seguro-desgravamen"
            label="Seg. Desgravamen Mensual (%)"
            type="number"
            step="0.001"
            value={inputs.seguroDesgravamenRate}
            onChange={(e) => {
              onChangeInputs(prev => ({ ...prev, seguroDesgravamenRate: Number(e.target.value) }));
              onSelectCustomBank();
            }}
          />

          <Input
            id="seguro-vehicular"
            label="Seg. Vehicular Mensual (S/.)"
            type="number"
            value={inputs.seguroVehicularMonthly}
            onChange={(e) => {
              onChangeInputs(prev => ({ ...prev, seguroVehicularMonthly: Number(e.target.value) }));
              onSelectCustomBank();
            }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            id="portes"
            label="Portes (S/.)"
            type="number"
            value={inputs.portes}
            onChange={(e) => {
              onChangeInputs(prev => ({ ...prev, portes: Number(e.target.value) }));
              onSelectCustomBank();
            }}
          />

          <Input
            id="gastos-adm"
            label="Gasto Adm. (S/.)"
            type="number"
            value={inputs.gastosAdministrativos}
            onChange={(e) => {
              onChangeInputs(prev => ({ ...prev, gastosAdministrativos: Number(e.target.value) }));
              onSelectCustomBank();
            }}
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

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="comision-desembolso"
            label="Comisión Desembolso (S/.)"
            type="number"
            value={inputs.comisionDesembolso}
            onChange={(e) => {
              onChangeInputs(prev => ({ ...prev, comisionDesembolso: Number(e.target.value) }));
              onSelectCustomBank();
            }}
          />

          <Input
            id="comision-evaluacion"
            label="Comisión Evaluación (S/.)"
            type="number"
            value={inputs.comisionEvaluacion}
            onChange={(e) => {
              onChangeInputs(prev => ({ ...prev, comisionEvaluacion: Number(e.target.value) }));
              onSelectCustomBank();
            }}
          />
        </div>
      </div>
    </Card>
  );
}

