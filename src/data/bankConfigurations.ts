import bcpLogo from '../assets/bcp.jpg';
import bbvaLogo from '../assets/bbva.jpg';
import interbankLogo from '../assets/interbank.png';
import scotiabankLogo from '../assets/scotiabank.png';

export interface BankConfig {
  tea: number; // Tasa Efectiva Anual (en decimal, e.g. 0.105 para 10.5%)
  seguroDesgravamenRate: number; // Tasa mensual de seguro de desgravamen (en decimal, e.g. 0.0005 para 0.05%)
  seguroVehicularMonthly: number; // Costo mensual fijo de seguro vehicular (en Soles, e.g. 150)
  portes: number; // Costo mensual de portes (en Soles, e.g. 15)
  gastosAdministrativos: number; // Gastos de administración mensuales (en Soles, e.g. 30)
  comisionDesembolso: number; // Comisión inicial única de desembolso (en Soles, e.g. 500)
  comisionEvaluacion: number; // Comisión inicial única de evaluación/tasación (en Soles, e.g. 265)
  cok: number; // Tasa de descuento anual (COK) para el deudor (en decimal, e.g. 0.10 para 10%)
}

export interface BankLimits {
  minVehiclePrice: number;      // Precio mínimo financiable (S/.)
  maxVehiclePrice: number;      // Precio máximo financiable (S/.)
  minDownPaymentPct: number;    // Cuota inicial mínima (%)
  maxDownPaymentPct: number;    // Cuota inicial máxima (%)
  terms: number[];              // Plazos permitidos (meses)
  maxGraceMonths: number;       // Meses de gracia máximos
  minResidualPct: number;       // Cuota final / residual mínima (%)
  maxResidualPct: number;       // Cuota final / residual máxima (%)
}

export interface Bank {
  id: string;
  name: string;
  fullName: string;
  logo: string;
  config: BankConfig;
  limits: BankLimits;
  features: string[];
}

export const bankConfigurations: Bank[] = [
  {
    id: 'bcp',
    name: 'BCP',
    fullName: 'Banco de Crédito del Perú',
    logo: bcpLogo,
    config: {
      tea: 0.1050, // 10.50%
      seguroDesgravamenRate: 0.00050, // 0.050% mensual
      seguroVehicularMonthly: 150.00,
      portes: 15.00,
      gastosAdministrativos: 30.00,
      comisionDesembolso: 500.00,
      comisionEvaluacion: 265.00,
      cok: 0.10, // 10% anual
    },
    limits: {
      minVehiclePrice: 20000,
      maxVehiclePrice: 300000,
      minDownPaymentPct: 20,
      maxDownPaymentPct: 50,
      terms: [24, 36, 48],
      maxGraceMonths: 3,
      minResidualPct: 30,
      maxResidualPct: 50,
    },
    features: [
      'Mayor red de agencias a nivel nacional',
      'Desembolso rápido de fondos',
      'Seguro vehicular con Rímac Seguros',
      'Plazos flexibles de gracia'
    ]
  },
  {
    id: 'bbva',
    name: 'BBVA',
    fullName: 'Banco BBVA Perú',
    logo: bbvaLogo,
    config: {
      tea: 0.0990, // 9.90%
      seguroDesgravamenRate: 0.00045, // 0.045% mensual
      seguroVehicularMonthly: 140.00,
      portes: 12.00,
      gastosAdministrativos: 25.00,
      comisionDesembolso: 450.00,
      comisionEvaluacion: 250.00,
      cok: 0.10,
    },
    limits: {
      minVehiclePrice: 15000,
      maxVehiclePrice: 400000,
      minDownPaymentPct: 15,
      maxDownPaymentPct: 40,
      terms: [12, 24, 36, 48, 60],
      maxGraceMonths: 3,
      minResidualPct: 20,
      maxResidualPct: 50,
    },
    features: [
      'Tasa de interés altamente competitiva',
      'Simulación y aprobación digital inmediata',
      'Sin penalidad por prepagos',
      'Hasta 3 meses de gracia total'
    ]
  },
  {
    id: 'interbank',
    name: 'Interbank',
    fullName: 'Interbank Perú',
    logo: interbankLogo,
    config: {
      tea: 0.1120, // 11.20%
      seguroDesgravamenRate: 0.00052, // 0.052% mensual
      seguroVehicularMonthly: 160.00,
      portes: 14.00,
      gastosAdministrativos: 28.00,
      comisionDesembolso: 520.00,
      comisionEvaluacion: 270.00,
      cok: 0.10,
    },
    limits: {
      minVehiclePrice: 18000,
      maxVehiclePrice: 350000,
      minDownPaymentPct: 20,
      maxDownPaymentPct: 45,
      terms: [24, 36, 48, 60],
      maxGraceMonths: 2,
      minResidualPct: 25,
      maxResidualPct: 50,
    },
    features: [
      'Proceso ágil y sin papeles',
      'Excelente seguro de desgravamen',
      'Financiamiento del 100% (sujeto a evaluación)',
      'Atención multicanal'
    ]
  },
  {
    id: 'scotiabank',
    name: 'Scotiabank',
    fullName: 'Scotiabank Perú',
    logo: scotiabankLogo,
    config: {
      tea: 0.1099, // 10.99%
      seguroDesgravamenRate: 0.00048, // 0.048% mensual
      seguroVehicularMonthly: 145.00,
      portes: 13.00,
      gastosAdministrativos: 26.00,
      comisionDesembolso: 480.00,
      comisionEvaluacion: 260.00,
      cok: 0.10,
    },
    limits: {
      minVehiclePrice: 20000,
      maxVehiclePrice: 320000,
      minDownPaymentPct: 25,
      maxDownPaymentPct: 50,
      terms: [24, 36, 48],
      maxGraceMonths: 3,
      minResidualPct: 30,
      maxResidualPct: 50,
    },
    features: [
      'Respaldo de grupo financiero internacional',
      'Tasas personalizadas según perfil',
      'Facilidad de pagos adelantados',
      'Opción de gracia total al inicio del préstamo'
    ]
  },
  {
    id: 'custom',
    name: 'Personalizado',
    fullName: 'Configuración Personalizada',
    logo: '',
    config: {
      tea: 0.1200, // 12.00%
      seguroDesgravamenRate: 0.00050, // 0.05% mensual
      seguroVehicularMonthly: 150.00,
      portes: 15.00,
      gastosAdministrativos: 30.00,
      comisionDesembolso: 500.00,
      comisionEvaluacion: 265.00,
      cok: 0.10,
    },
    limits: {
      minVehiclePrice: 5000,
      maxVehiclePrice: 1000000,
      minDownPaymentPct: 10,
      maxDownPaymentPct: 60,
      terms: [12, 24, 36, 48, 60, 72],
      maxGraceMonths: 6,
      minResidualPct: 0,
      maxResidualPct: 50,
    },
    features: [
      'Define tus propios parámetros financieros',
      'Ideal para simulaciones académicas',
      'Totalmente flexible y editable'
    ]
  }
];

/**
 * Valida las entradas del simulador contra los límites del banco seleccionado.
 * Devuelve una lista de mensajes de error (vacía si todo es válido).
 */
export function validateSimulation(
  inputs: {
    vehiclePrice: number;
    downPayment: number;
    downPaymentPct: number;
    termMonths: number;
    gracePeriodMonths: number;
    residualPercentage: number;
  },
  limits: BankLimits
): string[] {
  const errors: string[] = [];
  const fmt = (n: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n);

  if (!inputs.vehiclePrice || inputs.vehiclePrice <= 0) {
    errors.push('Ingresa el precio del vehículo.');
  } else if (inputs.vehiclePrice < limits.minVehiclePrice || inputs.vehiclePrice > limits.maxVehiclePrice) {
    errors.push(`El precio del vehículo debe estar entre ${fmt(limits.minVehiclePrice)} y ${fmt(limits.maxVehiclePrice)} para esta entidad.`);
  }

  if (inputs.downPaymentPct < limits.minDownPaymentPct || inputs.downPaymentPct > limits.maxDownPaymentPct) {
    errors.push(`La cuota inicial debe estar entre ${limits.minDownPaymentPct}% y ${limits.maxDownPaymentPct}% del precio para esta entidad.`);
  }

  if (inputs.vehiclePrice > 0 && inputs.downPayment >= inputs.vehiclePrice) {
    errors.push('La cuota inicial no puede ser mayor o igual al precio del vehículo.');
  }

  if (!limits.terms.includes(inputs.termMonths)) {
    errors.push(`El plazo de ${inputs.termMonths} meses no está disponible para esta entidad (permitidos: ${limits.terms.join(', ')}).`);
  }

  if (inputs.gracePeriodMonths > limits.maxGraceMonths) {
    errors.push(`El periodo de gracia no puede exceder ${limits.maxGraceMonths} meses para esta entidad.`);
  }

  if (inputs.gracePeriodMonths >= inputs.termMonths) {
    errors.push('El periodo de gracia debe ser menor al plazo total del crédito.');
  }

  if (inputs.residualPercentage < limits.minResidualPct || inputs.residualPercentage > limits.maxResidualPct) {
    errors.push(`La cuota final / residual debe estar entre ${limits.minResidualPct}% y ${limits.maxResidualPct}% para esta entidad.`);
  }

  return errors;
}
