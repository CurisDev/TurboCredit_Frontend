export interface SimulatorInputs {
  clientName: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehiclePrice: number;
  downPayment: number;
  downPaymentPct: number;
  tea: number;
  termMonths: number;
  gracePeriodMonths: number;
  gracePeriodType: 'TOTAL' | 'PARTIAL';
  residualPercentage: number;
  seguroDesgravamenRate: number;
  seguroVehicularMonthly: number;
  physicalShipping: boolean; // ¿Desea envío físico? Si es true, se cobran portes
  portes: number; // Costo de portes: 0 si no hay envío físico, 15 si lo hay
  gastosAdministrativos: number;
  gpsPrice: number; // Precio del GPS (S/.), entre 1000 y 5000
  comisionDesembolso: number;
  comisionEvaluacion: number;
  cok: number; // COK anual (%) - Dato del cliente, no del banco
}

export interface ScheduleItem {
  period: number;
  dueDate: string;
  beginningBalance: number;
  interest: number;
  amortization: number;
  installment: number; // cuota base
  lifeInsurance: number;
  vehicularInsurance: number;
  portes: number;
  administrationFee: number;
  totalInstallment: number; // cuota total
  remainingBalance: number;
  isGracePeriod: boolean;
}

export interface SimulatorResult {
  loanAmount: number;
  principalFinanced: number;
  fixedInstallment: number;
  residualValue: number;
  totalInterestPaid: number;
  totalPaid: number;
  npv: number;
  irr: number;
  tcea: number;
  schedule: ScheduleItem[];
}
