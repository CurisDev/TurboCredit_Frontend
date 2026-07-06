import { Coins, Info, AlertTriangle } from 'lucide-react';
import { Card } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import type { SimulatorInputs } from '../domain/models';
import type { BankLimits } from '../../../data/bankConfigurations';

interface FinancialFormProps {
  inputs: SimulatorInputs;
  onChangeInputs: (updater: (prev: SimulatorInputs) => SimulatorInputs) => void;
  onSelectCustomBank: () => void;
  limits: BankLimits;
  errors: string[];
}

export function FinancialForm({ inputs, onChangeInputs, onSelectCustomBank, limits, errors }: FinancialFormProps) {
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

      {errors.length > 0 && (
        <div
          className="flex flex-col gap-1 p-3 rounded-xl"
          style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.25)' }}
        >
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: '#f43f5e' }}>
            <AlertTriangle style={{ width: '14px', height: '14px' }} />
            Revisa las condiciones del banco
          </span>
          <ul className="list-disc pl-5 flex flex-col gap-0.5">
            {errors.map((err, i) => (
              <li key={i} className="text-xs" style={{ color: '#fda4af' }}>{err}</li>
            ))}
          </ul>
        </div>
      )}

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
          min={limits.minDownPaymentPct}
          max={limits.maxDownPaymentPct}
          step={5}
          value={inputs.downPaymentPct}
          onChange={(e) => handleDownPctChange(Number(e.target.value))}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-outline opacity-60">
          <span>Mín {limits.minDownPaymentPct}%</span>
          <span>Máx {limits.maxDownPaymentPct}%</span>
        </div>
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
          min={limits.minResidualPct}
          max={limits.maxResidualPct}
          step={5}
          value={inputs.residualPercentage}
          onChange={(e) => {
            onChangeInputs(prev => ({ ...prev, residualPercentage: Number(e.target.value) }));
            onSelectCustomBank();
          }}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-outline opacity-60">
          <span>Mín {limits.minResidualPct}%</span>
          <span>Máx {limits.maxResidualPct}%</span>
        </div>
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
              {limits.terms.map((t) => (
                <option key={t} value={t}>{t} meses</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="grace-months" className="text-label-bold" style={{ fontSize: '11px' }}>
            Meses de Gracia
          </label>
          <div className="luminous-input">
            <select
              id="grace-months"
              value={inputs.gracePeriodMonths}
              onChange={(e) => onChangeInputs(prev => ({ ...prev, gracePeriodMonths: Number(e.target.value) }))}
              style={{ width: '100%' }}
            >
              <option value={0}>Sin gracia</option>
              {Array.from({ length: limits.maxGraceMonths }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m} {m === 1 ? 'mes' : 'meses'}</option>
              ))}
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

      {/* Tipo de periodo de gracia (solo si hay meses de gracia) */}
      {inputs.gracePeriodMonths > 0 && (
        <div className="form-group">
          <label htmlFor="grace-type" className="text-label-bold flex items-center gap-1.5" style={{ fontSize: '11px' }}>
            Tipo de Periodo de Gracia
            <span
              title="Gracia Total: no se paga nada y el interés se capitaliza (aumenta la deuda). Gracia Parcial: se paga solo el interés y el capital no varía."
              className="cursor-help flex items-center"
            >
              <Info className="text-outline" style={{ width: '14px', height: '14px' }} />
            </span>
          </label>
          <div className="luminous-input">
            <select
              id="grace-type"
              value={inputs.gracePeriodType}
              onChange={(e) => onChangeInputs(prev => ({ ...prev, gracePeriodType: e.target.value as 'TOTAL' | 'PARTIAL' }))}
              style={{ width: '100%' }}
            >
              <option value="TOTAL">Gracia Total (capitaliza el interés)</option>
              <option value="PARTIAL">Gracia Parcial (paga solo el interés)</option>
            </select>
          </div>
        </div>
      )}

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

        <div className="grid grid-cols-2 gap-4">
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
            id="gps-price"
            label="Precio del GPS (S/.)"
            type="number"
            min={1000}
            max={5000}
            step="50"
            value={inputs.gpsPrice}
            onChange={(e) => {
              // Permite escribir libremente; el rango se ajusta al perder el foco
              onChangeInputs(prev => ({ ...prev, gpsPrice: Number(e.target.value) }));
            }}
            onBlur={(e) => {
              const raw = Number(e.target.value);
              // Evita valores irreales: se limita al rango permitido [1000, 5000]
              const clamped = Math.min(5000, Math.max(1000, isNaN(raw) ? 1000 : raw));
              onChangeInputs(prev => ({ ...prev, gpsPrice: clamped }));
            }}
          />
        </div>

        {/* Portes: solo se cobran (S/. 15) si el cliente elige envío físico */}
        <label
          htmlFor="physical-shipping"
          className="flex items-center gap-3 cursor-pointer p-3 rounded-xl"
          style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          <input
            id="physical-shipping"
            type="checkbox"
            checked={inputs.physicalShipping}
            onChange={(e) => {
              const checked = e.target.checked;
              onChangeInputs(prev => ({ ...prev, physicalShipping: checked, portes: checked ? 15 : 0 }));
              onSelectCustomBank();
            }}
            className="cursor-pointer"
            style={{ width: '18px', height: '18px' }}
          />
          <span className="flex flex-col">
            <span className="text-white text-sm font-bold">¿Desea envío físico?</span>
            <span className="text-outline text-xs">
              {inputs.physicalShipping ? 'Portes: S/. 15.00 mensuales' : 'Sin costo de portes (S/. 0.00)'}
            </span>
          </span>
        </label>

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

