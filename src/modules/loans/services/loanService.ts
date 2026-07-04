import type { SimulatorInputs, SimulatorResult } from '../domain/models';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082/api/v1';

// Moneda única elegida para el proyecto (acordado con el profesor: Soles).
const CURRENCY = 'PEN';

// Construye el cuerpo de la petición a partir de las entradas y los resultados
// calculados en el frontend (fuente de verdad de los cálculos).
const buildPayload = (inputs: SimulatorInputs, bankName: string, results?: SimulatorResult | null) => ({
  vehiclePrice: inputs.vehiclePrice,
  downPayment: inputs.downPayment,
  interestRate: inputs.tea,
  rateType: 'EFFECTIVE', // El proyecto opera con tasa efectiva (TEA)
  termMonths: inputs.termMonths,
  gracePeriodMonths: inputs.gracePeriodMonths,
  // El backend exige TOTAL|PARTIAL; cuando no hay gracia el tipo es irrelevante
  gracePeriodType: inputs.gracePeriodMonths > 0 ? inputs.gracePeriodType : 'TOTAL',
  currency: CURRENCY,
  insuranceCost: 0,
  bankName: bankName,
  clientName: inputs.clientName,
  vehicleBrand: inputs.vehicleBrand,
  vehicleModel: inputs.vehicleModel,
  residualPercentage: inputs.residualPercentage,
  seguroDesgravamenRate: inputs.seguroDesgravamenRate,
  seguroVehicularMonthly: inputs.seguroVehicularMonthly,
  portes: inputs.portes,
  gastosAdministrativos: inputs.gastosAdministrativos,
  comisionDesembolso: inputs.comisionDesembolso,
  comisionEvaluacion: inputs.comisionEvaluacion,
  cok: inputs.cok,
  // Resultados calculados en el frontend (el backend los persiste tal cual)
  ...(results ? {
    fixedInstallment: results.fixedInstallment,
    principalFinanced: results.principalFinanced,
    residualValue: results.residualValue,
    totalInterestPaid: results.totalInterestPaid,
    totalPaid: results.totalPaid,
    npv: results.npv,
    irr: results.irr,
    tcea: results.tcea,
  } : {}),
});

export const loanService = {
  saveCredit: async (token: string, inputs: SimulatorInputs, bankName: string, results?: SimulatorResult | null) => {
    const response = await fetch(`${API_BASE_URL}/vehicle-credits/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(buildPayload(inputs, bankName, results))
    });

    if (!response.ok) {
      throw new Error('Error al guardar la simulación en el servidor.');
    }

    return response.json(); // Retorna el VehicleCreditResource guardado
  },

  updateCredit: async (token: string, creditId: number, inputs: SimulatorInputs, bankName: string, results?: SimulatorResult | null) => {
    const response = await fetch(`${API_BASE_URL}/vehicle-credits/${creditId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(buildPayload(inputs, bankName, results))
    });

    if (!response.ok) {
      throw new Error('Error al actualizar la simulación en el servidor.');
    }

    return response.json();
  },

  getHistory: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/vehicle-credits/get-all`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al recuperar el historial de simulaciones.');
    }

    return response.json(); // Lista de VehicleCreditResource
  },

  getPaymentSchedule: async (token: string, creditId: number) => {
    const response = await fetch(`${API_BASE_URL}/payment-schedules/credit/${creditId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al recuperar el cronograma detallado.');
    }

    return response.json(); // AmortizationScheduleResource
  }
};
