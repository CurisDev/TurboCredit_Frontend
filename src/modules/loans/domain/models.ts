export interface SimulatorInputs {
  clientName: string;
  clientDni: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehiclePrice: number;
  downPayment: number;
  downPaymentPct: number;
  tea: number;
  termMonths: number;
  gracePeriodMonths: number;
  residualPercentage: number;
  seguroDesgravamenRate: number;
  seguroVehicularMonthly: number;
  portes: number;
  cok: number;
  monthlyIncome: number;
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
