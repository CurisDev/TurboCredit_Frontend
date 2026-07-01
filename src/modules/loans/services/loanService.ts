import type { SimulatorInputs } from '../domain/models';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082/api/v1';

export const loanService = {
  saveCredit: async (token: string, inputs: SimulatorInputs, bankName: string) => {
    const response = await fetch(`${API_BASE_URL}/vehicle-credits/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        vehiclePrice: inputs.vehiclePrice,
        downPayment: inputs.downPayment,
        interestRate: inputs.tea,
        rateType: 'EFFECTIVE',
        termMonths: inputs.termMonths,
        gracePeriodMonths: inputs.gracePeriodMonths,
        gracePeriodType: 'TOTAL',
        currency: 'PEN',
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
        cok: inputs.cok
      })
    });

    if (!response.ok) {
      throw new Error('Error al guardar la simulación en el servidor.');
    }

    return response.json(); // Retorna el VehicleCreditResource guardado
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
