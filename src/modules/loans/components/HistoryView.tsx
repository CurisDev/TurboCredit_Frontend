import { useState } from 'react';

interface HistoryViewProps {
  history: any[];
  selectedHistoryId: number | null;
  onSelectHistory: (sim: any) => void;
  onLoadIntoSimulator: (sim: any) => void;
}

export function HistoryView({
  history,
  selectedHistoryId,
  onSelectHistory,
  onLoadIntoSimulator
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

  // Imágenes decorativas por marca de vehículo para simular un look ultra premium
  const getVehicleImage = (brand: string) => {
    const b = (brand || '').toLowerCase();
    if (b.includes('bmw')) {
      return 'https://lh3.googleusercontent.com/aida/AP1WRLvjTWsGXghgyhnfyV9HydLYyY949pcg-8iedZuwRHeKih3MBCipOvBFZrXTWYlbaXTcyPgfB_SuUcoGm4LNo1rlHiE0cSh9k81mP6klIx6G3WR8V4YsIhpBPczd6aOcgbYDgVDz2fQCpO6zlmENya6znGlAUzTZoxUopgJPjmfRRd_lN2VNeS8Z4fAuwi8nlY9nK4BTvSfnsDnwWAatAr0oH1XLw7AKZFDs-Hn2dmHwVIFwpK2kWra9FSs8';
    } else if (b.includes('audi') || b.includes('e-tron')) {
      return 'https://lh3.googleusercontent.com/aida/AP1WRLuLuosPjQFTEzkZbRVwSUuU9Q-QTSfDVzji4uJG6j-YTqwmolMsLmifN2n1OOFmKWCWksdmbBGnruc8XR2eWT9s3CwRpObfYHtmEQyLK4LLWrMCLCualR35j37xIb8XQP4LioRlXLH5492IzPFOogUmwBveqR4HHaGumF7zQNOJ8b6P4FvT1vAKkCHn5wu2kSh0fst7NYfGNVvf3fwJ0TZPJrKpSc2qICilM3zQuisZwmYbqXPEaC7MFIom';
    } else if (b.includes('volvo') || b.includes('xc40')) {
      return 'https://lh3.googleusercontent.com/aida/AP1WRLuoMh74-j1cMer2vcCf-doUUIibFFvJHW-RYdqmymR8i0kg6z0udSat1UsOd3EAy3LbP0k6H4QhlKWWD7mWnu5KW_wRa7QuL91pbP4fu6eJUtWmkajNzdo2fd2Rcy08vqMWFrVJfGiwZXfHTGQwyVDGsM-SBtYe-bR-6mDjvjorYO4mY0H1PQwW2dLSwdxDi7QgU_Vv6OP-kfL3Zw2uY5JCXQxvviTjhrJlsZwaapVl_p-zOPi8PUeBO_w';
    }
    // Default sedan
    return 'https://lh3.googleusercontent.com/aida/AP1WRLvZWSdYcKJy_gExaIyFWy0GFyOQEjrEN3JduybyI37mZLoIyrVIl02PvRgQNicXSifevpqn6QJZzrqfegGCwnijxRz4WwcKdGxlsxgL1nWbzvKYQc7Na_7Z2-JBSSXMrXefkcWiyq6-REUsLaWVSoKDzJnw6ImqBjGRLYK9h7MxtU5B8LSkNmQ80-6fFTxdojT6qiWXubhDOecGLHOEKU-8Rc4vvsuMUdYz9_IKs5GmGmXlHHG0E1P_lfeI';
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
                    <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#070d1f', flexShrink: 0, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <img
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        src={getVehicleImage(sim.vehicleBrand)}
                        alt={sim.vehicleModel}
                      />
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
                        Cliente: {sim.clientName}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'white', padding: '2px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <img
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdhg8bROqj95IP6opXG7nLTUHfgkypZlmAI2Sx3LsPrBOM1bUPWLvo7bHHler5DjmQyMyG_dksBLP2CpGAHmHHKf0R6ciBFQ2Qds8AqH_Li0VrR1zI3dr8U7UBIM3cGIhx5m8i9JQCvojzFkoNEHEF7ajZBWDwtGqkub9B8B9woY7RW5-BXzVN0YIJclR0thbR3sPj7l40n-MZgdkk1WI0lBPEHsG9pZLPwHbD4LIEkZkZwcau4oHTXKvPyP2pdACkwHI"
                            alt="banco"
                          />
                        </div>
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
              {/* Detail Hero */}
              <div className="detail-hero">
                <img
                  className="detail-hero-img"
                  src={getVehicleImage(selectedSim.vehicleBrand)}
                  alt="Vehículo Cabecera"
                />
                <div className="detail-hero-overlay"></div>
                <div className="detail-hero-content">
                  <div className="flex items-center gap-3 mb-2">
                    <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: 'rgba(78, 222, 163, 0.1)', border: '1px solid rgba(78, 222, 163, 0.2)', color: '#4edea3', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600 }}>
                      APROBADO
                    </span>
                    <span className="text-outline text-xs opacity-80">
                      ID: TC-{selectedSim.id.toString().substring(0, 7)}
                    </span>
                  </div>
                  <h1 className="text-white font-bold" style={{ fontSize: '1.5rem' }}>
                    {selectedSim.vehicleBrand} {selectedSim.vehicleModel}
                  </h1>
                </div>
              </div>

              {/* Detail Metrics */}
              <div className="p-6 flex flex-col gap-6">
                <div className="grid grid-cols-4 gap-4">
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
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <span className="text-outline">Cliente</span>
                      <span className="text-white font-bold">{selectedSim.clientName}</span>
                    </div>
                    <div className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <span className="text-outline">Banco / Entidad</span>
                      <span className="text-white font-bold">{selectedSim.bankName}</span>
                    </div>
                    <div className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <span className="text-outline">Gracia Total</span>
                      <span className="text-white font-bold">{selectedSim.gracePeriodMonths} meses</span>
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
                    <div className="flex justify-between py-2 col-span-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
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
                    onClick={() => window.print()}
                    className="btn-secondary px-6 py-3 text-center flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">description</span>
                    <span>Imprimir Reporte</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center flex flex-col items-center justify-center">
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
