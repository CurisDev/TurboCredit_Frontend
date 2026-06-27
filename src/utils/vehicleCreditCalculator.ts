export interface SimulatorInputs {
  clientName: string;
  clientDni: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehiclePrice: number; // en Soles, e.g. 60000
  downPayment: number; // en Soles, e.g. 12000 (20%)
  downPaymentPct: number; // e.g. 20
  tea: number; // e.g. 10.50 (%)
  termMonths: number; // e.g. 24
  gracePeriodMonths: number; // e.g. 2
  residualPercentage: number; // e.g. 40
  seguroDesgravamenRate: number; // e.g. 0.05 (%)
  seguroVehicularMonthly: number; // e.g. 150
  portes: number; // e.g. 15
  cok: number; // e.g. 10.0 (%) - COK anual
}

export interface ScheduleItem {
  period: number;
  dueDate: string;
  beginningBalance: number;
  interest: number;
  amortization: number;
  installment: number; // cuota base
  lifeInsurance: number; // seguro desgravamen
  vehicularInsurance: number;
  portes: number;
  totalInstallment: number; // cuota total
  remainingBalance: number;
  isGracePeriod: boolean;
}

export interface SimulatorResult {
  loanAmount: number;
  principalFinanced: number; // Capitalizado después de gracia
  fixedInstallment: number;
  residualValue: number;
  totalInterestPaid: number;
  totalPaid: number;
  npv: number;
  irr: number;
  tcea: number;
  schedule: ScheduleItem[];
}

const round = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

export const vehicleCreditCalculator = {
  calculate: (inputs: SimulatorInputs): SimulatorResult => {
    const loanAmount = inputs.vehiclePrice - inputs.downPayment;
    const teaDec = inputs.tea / 100;
    const tem = Math.pow(1 + teaDec, 1 / 12) - 1; // Tasa Efectiva Mensual

    const g = inputs.gracePeriodMonths;
    const n = inputs.termMonths - g;
    
    if (n <= 0) {
      throw new Error('El plazo total debe ser mayor a los meses de gracia');
    }

    // 1. Capitalización durante gracia total: L_g = L_0 * (1 + TEM)^g
    const l_g = loanAmount * Math.pow(1 + tem, g);

    // 2. Cuota residual (Valor Residuo): VF = precioVehiculo * residualPct / 100
    const residualValue = round(inputs.vehiclePrice * (inputs.residualPercentage / 100));

    // 3. Principal ajustado para calcular cuota: L_adj = L_g - VF / (1 + TEM)^n
    const l_adj = l_g - (residualValue / Math.pow(1 + tem, n));

    // 4. Calcular cuota mensual fija (C)
    const fixedInstallment = tem === 0
      ? round(l_adj / n)
      : round(l_adj * (tem * Math.pow(1 + tem, n)) / (Math.pow(1 + tem, n) - 1));

    // 5. Generar cronograma
    let remainingBalance = loanAmount;
    const schedule: ScheduleItem[] = [];
    let totalInterestPaid = 0;

    const today = new Date();

    // Seguro de desgravamen rate mensual
    const desgravamenRateDec = inputs.seguroDesgravamenRate / 100;

    // Períodos de gracia (Gracia Total)
    for (let period = 1; period <= g; period++) {
      const beginningBalance = remainingBalance;
      const interest = round(beginningBalance * tem);
      const amortization = 0;
      const installment = 0;

      // El interés de gracia total capitaliza en el saldo deudor
      remainingBalance = round(remainingBalance + interest);

      const lifeInsurance = round(remainingBalance * desgravamenRateDec); // sobre saldo capitalizado
      const vehicularInsurance = inputs.seguroVehicularMonthly;
      const portes = inputs.portes;
      const totalInstallment = round(installment + lifeInsurance + vehicularInsurance + portes);

      const dueDate = new Date(today);
      dueDate.setMonth(today.getMonth() + period);

      schedule.push({
        period,
        dueDate: dueDate.toLocaleDateString('es-PE'),
        beginningBalance: round(beginningBalance),
        interest: round(interest),
        amortization: round(amortization),
        installment: round(installment),
        lifeInsurance: round(lifeInsurance),
        vehicularInsurance: round(vehicularInsurance),
        portes: round(portes),
        totalInstallment: round(totalInstallment),
        remainingBalance: round(remainingBalance),
        isGracePeriod: true,
      });

      totalInterestPaid += interest;
    }

    // Períodos normales
    for (let period = g + 1; period <= inputs.termMonths; period++) {
      const beginningBalance = remainingBalance;
      const interest = round(beginningBalance * tem);
      let installment = fixedInstallment;
      let amortization = round(installment - interest);

      if (period === inputs.termMonths) {
        // En el último mes, se liquida la deuda (incluido el valor residual)
        amortization = beginningBalance;
        installment = round(amortization + interest);
        remainingBalance = 0;
      } else {
        remainingBalance = round(remainingBalance - amortization);
      }

      const lifeInsurance = round(beginningBalance * desgravamenRateDec); // seguro sobre saldo inicial deudor del mes
      const vehicularInsurance = inputs.seguroVehicularMonthly;
      const portes = inputs.portes;
      const totalInstallment = round(installment + lifeInsurance + vehicularInsurance + portes);

      const dueDate = new Date(today);
      dueDate.setMonth(today.getMonth() + period);

      schedule.push({
        period,
        dueDate: dueDate.toLocaleDateString('es-PE'),
        beginningBalance: round(beginningBalance),
        interest: round(interest),
        amortization: round(amortization),
        installment: round(installment),
        lifeInsurance: round(lifeInsurance),
        vehicularInsurance: round(vehicularInsurance),
        portes: round(portes),
        totalInstallment: round(totalInstallment),
        remainingBalance: round(remainingBalance),
        isGracePeriod: false,
      });

      totalInterestPaid += interest;
    }

    // 6. Calcular VAN, TIR, TCEA
    // Inversión Inicial (desde el punto de vista del deudor): Préstamo recibido
    const initialInflow = loanAmount;

    const flows: number[] = [initialInflow];
    for (const item of schedule) {
      flows.push(-item.totalInstallment); // pagos mensuales
    }

    // TIR mensual
    const irrMonthly = vehicleCreditCalculator.calculateIRR(flows, tem || 0.01);
    
    // TCEA
    const tcea = Math.pow(1 + irrMonthly, 12) - 1;

    // VAN (usando COK anual convertido a mensual)
    const cokAnnualDec = inputs.cok / 100;
    const cokMonthly = Math.pow(1 + cokAnnualDec, 1 / 12) - 1;
    const npv = vehicleCreditCalculator.calculateNPV(flows, cokMonthly);

    const totalPaid = round(schedule.reduce((sum, item) => sum + item.totalInstallment, 0));

    return {
      loanAmount,
      principalFinanced: round(l_g),
      fixedInstallment,
      residualValue,
      totalInterestPaid: round(totalInterestPaid),
      totalPaid,
      npv: round(npv),
      irr: round(irrMonthly * 100),
      tcea: round(tcea * 100),
      schedule,
    };
  },

  calculateNPV: (flows: number[], monthlyRate: number): number => {
    let npv = flows[0]; // Flujo cero
    for (let t = 1; t < flows.length; t++) {
      npv += flows[t] / Math.pow(1 + monthlyRate, t);
    }
    return npv;
  },

  calculateIRR: (flows: number[], guess: number): number => {
    let irr = guess;
    const tolerance = 0.0000001;
    const maxIterations = 1000;

    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let npvDerivative = 0;

      for (let t = 0; t < flows.length; t++) {
        const factor = Math.pow(1 + irr, t);
        npv += flows[t] / factor;
        if (t > 0) {
          npvDerivative -= flows[t] * t / (factor * (1 + irr));
        }
      }

      if (Math.abs(npv) < tolerance) {
        return irr;
      }

      if (npvDerivative === 0) {
        break;
      }

      const nextIrr = irr - npv / npvDerivative;
      if (isNaN(nextIrr) || !isFinite(nextIrr) || nextIrr < -1 || nextIrr > 10) {
        break;
      }

      if (Math.abs(nextIrr - irr) < tolerance) {
        return nextIrr;
      }

      irr = nextIrr;
    }
    return irr;
  }
};
