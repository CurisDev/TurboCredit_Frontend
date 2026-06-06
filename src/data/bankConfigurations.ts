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

export interface Bank {
  id: string;
  name: string;
  fullName: string;
  logo: string;
  config: BankConfig;
  features: string[];
}

export const bankConfigurations: Bank[] = [
  {
    id: 'bcp',
    name: 'BCP',
    fullName: 'Banco de Crédito del Perú',
    logo: 'https://companieslogo.com/img/orig/BAP_BIG-1b32d0cc.png?t=1653555239',
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
    logo: 'https://companieslogo.com/img/orig/BBVA_BIG-a89e0237.png?t=1654497556',
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
    logo: 'https://companieslogo.com/img/orig/IFS_BIG-0255af15.png?t=1648383849',
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
    logo: 'https://companieslogo.com/img/orig/BNS.TO_BIG-0c2c3ab9.png?t=1648382743',
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
    features: [
      'Define tus propios parámetros financieros',
      'Ideal para simulaciones académicas',
      'Totalmente flexible y editable'
    ]
  }
];
