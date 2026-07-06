import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { vehicleCreditCalculator } from '../../../utils/vehicleCreditCalculator';
import type { SimulatorInputs } from '../domain/models';
import { bankConfigurations } from '../../../data/bankConfigurations';

interface HistoryViewProps {
  history: any[];
  selectedHistoryId: number | null;
  onSelectHistory: (sim: any) => void;
  onLoadIntoSimulator: (sim: any) => void;
  fallbackClientName?: string;
}

export function HistoryView({
  history,
  selectedHistoryId,
  onSelectHistory,
  onLoadIntoSimulator,
  fallbackClientName = ''
}: HistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const fmtCurrency = (val: number) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(val);
  };

  const fmtPercent = (val: number) => {
    return new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(val) + '%';
  };

  const filteredHistory = history.filter((sim: any) => {
    const term = searchTerm.toLowerCase();
    const brand = (sim.vehicleBrand || '').toLowerCase();
    const model = (sim.vehicleModel || '').toLowerCase();
    const client = (sim.clientName || '').toLowerCase();
    const bank = (sim.bankName || '').toLowerCase();
    return brand.includes(term) || model.includes(term) || client.includes(term) || bank.includes(term);
  });

  const selectedSim = history.find(sim => sim.id === selectedHistoryId) || history[0];

  const handleCardClick = (sim: any) => {
    onSelectHistory(sim);
  };

  // Logo del banco donde se realizó la simulación
  const getBankLogo = (bankName: string) => {
    const bank = bankConfigurations.find(b => b.name.toLowerCase() === (bankName || '').toLowerCase());
    return bank?.logo || '';
  };

  // Genera y DESCARGA un PDF con SOLO el plan de pagos de la simulación
  const handlePrintSchedule = (sim: any) => {
    // Reconstruye las entradas del simulador a partir de la simulación guardada
    const inputs: SimulatorInputs = {
      clientName: sim.clientName || fallbackClientName || 'Cliente',
      vehicleBrand: sim.vehicleBrand || '',
      vehicleModel: sim.vehicleModel || '',
      vehiclePrice: sim.vehiclePrice || 0,
      downPayment: sim.downPayment || 0,
      downPaymentPct: sim.vehiclePrice ? (sim.downPayment / sim.vehiclePrice) * 100 : 0,
      tea: sim.interestRate ?? sim.tea ?? 0,
      termMonths: sim.termMonths || 24,
      gracePeriodMonths: sim.gracePeriodMonths || 0,
      gracePeriodType: sim.gracePeriodType === 'PARTIAL' ? 'PARTIAL' : 'TOTAL',
      residualPercentage: sim.residualPercentage ?? 0,
      seguroDesgravamenRate: sim.seguroDesgravamenRate ?? 0,
      seguroVehicularMonthly: sim.seguroVehicularMonthly ?? 0,
      physicalShipping: (sim.portes ?? 0) > 0,
      portes: sim.portes ?? 0,
      gastosAdministrativos: sim.gastosAdministrativos ?? 0,
      gpsPrice: sim.gpsPrice ?? 1000,
      comisionDesembolso: sim.comisionDesembolso ?? 0,
      comisionEvaluacion: sim.comisionEvaluacion ?? 0,
      cok: sim.cok ?? 0,
    };

    let result;
    try {
      result = vehicleCreditCalculator.calculate(inputs);
    } catch {
      alert('No se pudo generar el plan de pagos de esta simulación.');
      return;
    }

    const money = (n: number) =>
      'S/ ' + (n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const tcea = (sim.tcea ?? result.tcea);

    const buildPdf = (logoData: string | null) => {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();

      if (logoData) {
        try { doc.addImage(logoData, 'PNG', 12, 8, 20, 20); } catch { /* logo opcional */ }
      }
      const textX = logoData ? 36 : 12;
      doc.setFontSize(14); doc.setFont('helvetica', 'bold');
      doc.text('Plan de Pagos - Método Francés (Compra Inteligente)', textX, 15);
      doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(80);
      doc.text(`${sim.bankName || 'Entidad'}  -  ${sim.vehicleBrand || ''} ${sim.vehicleModel || ''}`.trim(), textX, 21);

      doc.setFontSize(8); doc.setTextColor(30);
      const meta = [
        `Cliente: ${sim.clientName || fallbackClientName || '-'}`,
        `Precio: ${money(sim.vehiclePrice)}`,
        `Cuota inicial: ${money(sim.downPayment)}`,
        `Financiado: ${money(result.loanAmount)}`,
        `Plazo: ${sim.termMonths} meses`,
        `TEA: ${sim.interestRate ?? sim.tea ?? 0}%`,
        `TCEA: ${typeof tcea === 'number' ? tcea.toFixed(2) : tcea}%`,
        `Cuota fija: ${money(result.fixedInstallment)}`,
      ];
      doc.text(meta.join('    |    '), 12, 30, { maxWidth: pageW - 24 });

      autoTable(doc, {
        startY: 36,
        head: [[
          'N°', 'Vencimiento', 'Saldo Inicial', 'Interés', 'Amortización',
          'Cuota Base', 'Desgravamen', 'Seg. Vehic.', 'Portes/Gastos', 'Cuota Total', 'Saldo Final',
        ]],
        body: result.schedule.map((item) => [
          String(item.period),
          item.dueDate,
          money(item.beginningBalance),
          money(item.interest),
          money(item.amortization),
          money(item.installment),
          money(item.lifeInsurance),
          money(item.vehicularInsurance),
          money(item.portes + item.administrationFee),
          money(item.totalInstallment),
          money(item.remainingBalance),
        ]),
        styles: { fontSize: 7, cellPadding: 1.5, halign: 'right' },
        headStyles: { fillColor: [24, 24, 32], textColor: 255, halign: 'center', fontSize: 6.5 },
        columnStyles: { 0: { halign: 'center' }, 1: { halign: 'center' } },
        margin: { left: 12, right: 12 },
        didParseCell: (data) => {
          const item = result!.schedule[data.row.index];
          if (data.section === 'body' && item?.isGracePeriod) {
            data.cell.styles.fillColor = [255, 247, 230];
          }
        },
      });

      const finalY = (doc as any).lastAutoTable?.finalY ?? 36;
      doc.setFontSize(7); doc.setTextColor(120);
      doc.text(
        `TurboCredit  -  Generado el ${new Date().toLocaleDateString('es-PE')}  -  Fines informativos (SBS Transparencia)`,
        pageW - 12, finalY + 6, { align: 'right' }
      );

      const fileName = `plan-de-pagos-${sim.vehicleBrand || 'auto'}-${sim.vehicleModel || ''}`
        .trim().replace(/\s+/g, '-').replace(/-+$/, '').toLowerCase();
      doc.save(`${fileName}.pdf`);
    };

    // Carga el logo del banco (opcional) y luego genera el PDF
    const logoRaw = getBankLogo(sim.bankName);
    if (!logoRaw) { buildPdf(null); return; }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d')?.drawImage(img, 0, 0);
        buildPdf(canvas.toDataURL('image/png'));
      } catch {
        buildPdf(null);
      }
    };
    img.onerror = () => buildPdf(null);
    img.src = new URL(logoRaw, window.location.href).href;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <section className="flex justify-between items-end gap-4" style={{ flexWrap: 'wrap' }}>
        <div>
          <h2 className="text-headline-lg text-white">Historial de Simulaciones</h2>
          <p className="text-outline text-body-sm mt-1" style={{ maxWidth: '600px' }}>
            Revisa y compara tus cálculos previos para tomar la mejor decisión financiera.
          </p>
        </div>
        <div className="flex gap-2 w-full" style={{ maxWidth: '300px' }}>
          <div className="luminous-input flex items-center pl-4 w-full">
            <span className="material-symbols-outlined text-outline">search</span>
            <input
              placeholder="Buscar cliente o auto..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Simulation List (Left Panel) - 5/12 span */}
        <div className="col-span-5 flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
            <span className="text-label-bold text-xs">
              Simulaciones Guardadas ({filteredHistory.length})
            </span>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="glass-card p-8 text-center" style={{ borderStyle: 'dashed' }}>
              <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">search_off</span>
              <p className="text-xs text-outline">No se encontraron simulaciones que coincidan con tu búsqueda.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
              {filteredHistory.map((sim: any) => {
                const isActive = selectedHistoryId === sim.id;
                return (
                  <div
                    key={sim.id}
                    onClick={() => handleCardClick(sim)}
                    className="glass-card p-4 flex gap-4 cursor-pointer"
                    style={isActive ? { borderColor: '#8083ff', background: 'rgba(128, 131, 255, 0.1)', boxShadow: '0 0 20px rgba(128,131,255,0.1)' } : { opacity: 0.8 }}
                  >
                    <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {getBankLogo(sim.bankName) ? (
                        <img
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          src={getBankLogo(sim.bankName)}
                          alt={sim.bankName}
                        />
                      ) : (
                        <span className="material-symbols-outlined" style={{ color: '#334155' }}>account_balance</span>
                      )}
                    </div>
                    <div className="flex-grow min-w-0 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-1">
                        <h3 className="text-white truncate font-bold" style={{ fontSize: '0.875rem' }}>
                          {sim.vehicleBrand} {sim.vehicleModel}
                        </h3>
                        <span style={{ fontSize: '10px', backgroundColor: 'rgba(78, 222, 163, 0.1)', border: '1px solid rgba(78, 222, 163, 0.2)', color: '#4edea3', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>
                          TCEA: {fmtPercent(sim.tcea || sim.interestRate || 10.5)}
                        </span>
                      </div>
                      <p className="text-xs text-outline truncate mt-0.5">
                        Cliente: {sim.clientName || fallbackClientName || '—'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="material-symbols-outlined text-outline" style={{ fontSize: '16px' }}>account_balance</span>
                        <span className="text-[11px] font-bold text-outline truncate">{sim.bankName}</span>
                        <span className="text-[10px] text-outline ml-auto shrink-0 opacity-60">
                          {sim.termMonths} meses
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail View (Right Panel) - 7/12 span */}
        <div className="col-span-7">
          {selectedSim ? (
            <div className="glass-card flex flex-col" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Detail Header */}
              <div className="p-6 flex items-center gap-4" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                {getBankLogo(selectedSim.bankName) && (
                  <div style={{ width: '56px', height: '56px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      src={getBankLogo(selectedSim.bankName)}
                      alt={selectedSim.bankName}
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-outline text-xs opacity-80">ID: TC-{selectedSim.id.toString().substring(0, 7)}</span>
                  <h1 className="text-white font-bold truncate" style={{ fontSize: '1.5rem' }}>
                    {selectedSim.vehicleBrand} {selectedSim.vehicleModel}
                  </h1>
                </div>
              </div>

              {/* Detail Metrics */}
              <div className="p-6 flex flex-col gap-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div style={{ borderLeft: '4px solid #8083ff', paddingLeft: '1rem' }}>
                    <p className="text-outline text-[10px] uppercase font-bold tracking-widest">Precio Auto</p>
                    <p className="text-sm text-primary font-bold mt-0.5">
                      {fmtCurrency(selectedSim.vehiclePrice)}
                    </p>
                  </div>
                  <div style={{ borderLeft: '4px solid #4edea3', paddingLeft: '1rem' }}>
                    <p className="text-outline text-[10px] uppercase font-bold tracking-widest">Cuota Inicial</p>
                    <p className="text-sm text-secondary font-bold mt-0.5">
                      {fmtCurrency(selectedSim.downPayment)}
                    </p>
                  </div>
                  <div style={{ borderLeft: '4px solid #2dd4bf', paddingLeft: '1rem' }}>
                    <p className="text-outline text-[10px] uppercase font-bold tracking-widest">Plazo</p>
                    <p className="text-sm text-white font-bold mt-0.5">
                      {selectedSim.termMonths} Meses
                    </p>
                  </div>
                  <div style={{ borderLeft: '4px solid #facc15', paddingLeft: '1rem' }}>
                    <p className="text-outline text-[10px] uppercase font-bold tracking-widest">TCEA</p>
                    <p className="text-sm text-warning-yellow font-bold mt-0.5">
                      {fmtPercent(selectedSim.tcea || selectedSim.interestRate || 10.5)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h4 className="text-headline-md text-base text-white font-bold pb-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    Resumen Financiero Proyectado
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <span className="text-outline">Cliente</span>
                      <span className="text-white font-bold">{selectedSim.clientName || fallbackClientName || '—'}</span>
                    </div>
                    <div className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <span className="text-outline">Banco / Entidad</span>
                      <span className="text-white font-bold">{selectedSim.bankName}</span>
                    </div>
                    <div className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <span className="text-outline">Periodo de Gracia</span>
                      <span className="text-white font-bold">
                        {selectedSim.gracePeriodMonths > 0
                          ? `${selectedSim.gracePeriodMonths} meses (${selectedSim.gracePeriodType === 'PARTIAL' ? 'Parcial' : 'Total'})`
                          : 'Sin gracia'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <span className="text-outline">Tasa Interés (TEA)</span>
                      <span className="text-white font-bold">{selectedSim.interestRate || selectedSim.tea}%</span>
                    </div>
                    <div className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <span className="text-outline">Cuota Final Residual</span>
                      <span className="text-white font-bold">
                        {selectedSim.residualPercentage}% ({fmtCurrency((selectedSim.vehiclePrice || 0) * ((selectedSim.residualPercentage || 40) / 100))})
                      </span>
                    </div>
                    <div className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <span className="text-outline">VAN (Persp. Deudor)</span>
                      <span className="text-positive-emerald font-bold">{fmtCurrency(selectedSim.npv || 0)}</span>
                    </div>
                    <div className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <span className="text-outline">TIR Mensual</span>
                      <span className="text-warning-yellow font-bold">{fmtPercent(selectedSim.irr || 0)}</span>
                    </div>
                    <div className="flex justify-between py-2 col-span-1 sm:col-span-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <span className="text-outline font-bold" style={{ fontSize: '0.875rem' }}>Cuota Mensual Estimada (Fija)</span>
                      <span className="text-secondary font-bold" style={{ fontSize: '1.1rem' }}>{fmtCurrency(selectedSim.fixedInstallment || 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => onLoadIntoSimulator(selectedSim)}
                    className="btn-primary flex-grow py-3 text-center flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">calculate</span>
                    <span>Cargar en Simulador</span>
                  </button>
                  <button
                    onClick={() => handlePrintSchedule(selectedSim)}
                    className="btn-secondary px-6 py-3 text-center flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">picture_as_pdf</span>
                    <span>Descargar Plan de Pagos</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center flex flex-col items-center justify-center" style={{ minHeight: '420px' }}>
              <span className="material-symbols-outlined text-5xl block mb-2 opacity-50">analytics</span>
              <h3 className="text-lg font-bold text-white mb-1">Sin simulación seleccionada</h3>
              <p className="text-xs text-outline">Por favor, selecciona una simulación del panel izquierdo para ver su análisis financiero completo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
