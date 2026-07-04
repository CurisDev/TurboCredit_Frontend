import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// Shared
import { Alert } from './shared/components/Alert';

// IAM (Identity & Access Management)
import { LoginForm } from './modules/iam/components/LoginForm';
import { RegisterForm } from './modules/iam/components/RegisterForm';
import { ProfileForm } from './modules/iam/components/ProfileForm';

// Loans
import { BankSelector } from './modules/loans/components/BankSelector';
import { VehicleForm } from './modules/loans/components/VehicleForm';
import { FinancialForm } from './modules/loans/components/FinancialForm';
import { MetricsPanel } from './modules/loans/components/MetricsPanel';
import { ScheduleTable } from './modules/loans/components/ScheduleTable';
import { HistoryView } from './modules/loans/components/HistoryView';

import type { SimulatorInputs, SimulatorResult } from './modules/loans/domain/models';
import { loanService } from './modules/loans/services/loanService';
import { profileService } from './modules/iam/services/profileService';
import { vehicleCreditCalculator } from './utils/vehicleCreditCalculator';
import { bankConfigurations, validateSimulation } from './data/bankConfigurations';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082/api/v1';

export default function App() {
  // --- Estados de Autenticación ---
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName'));
  const [, setUserId] = useState<string | null>(localStorage.getItem('userId'));
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('userEmail'));
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    const AUTO_COLLAPSE_WIDTH = 1300; // px
    let ticking = false;

    const applyState = () => {
      const shouldCollapse = window.innerWidth <= AUTO_COLLAPSE_WIDTH;
      setSidebarCollapsed((prev) => (prev === shouldCollapse ? prev : shouldCollapse));
      ticking = false;
    };

    const handleResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(applyState);
        ticking = true;
      }
    };

    applyState(); // estado correcto apenas carga, sin esperar el primer resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // --- Estados del Simulador ---
  const [selectedBankId, setSelectedBankId] = useState<string>('bcp');
  const [inputs, setInputs] = useState<SimulatorInputs>({
    clientName: localStorage.getItem('userName') || '',
    vehicleBrand: '',
    vehicleModel: '',
    vehiclePrice: 0,
    downPayment: 0,
    downPaymentPct: 20,
    tea: 10.50,
    termMonths: 24,
    gracePeriodMonths: 0,
    gracePeriodType: 'TOTAL',
    residualPercentage: 40,
    seguroDesgravamenRate: 0.050,
    seguroVehicularMonthly: 150,
    portes: 15,
    gastosAdministrativos: 30,
    comisionDesembolso: 500,
    comisionEvaluacion: 265,
    cok: 10.0,
  });

  const [results, setResults] = useState<SimulatorResult | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | 'loading'; message: string } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);
  // Id del crédito guardado que se está editando (null = nueva simulación)
  const [editingId, setEditingId] = useState<number | null>(null);
  // Nombre del cliente obtenido del endpoint de perfil (fallback para el historial)
  const [profileName, setProfileName] = useState<string>('');

  const roundValue = (val: number): number => Math.round(val * 100) / 100;

  // Límites del banco seleccionado y validación de las condiciones ingresadas
  const selectedBank = bankConfigurations.find(b => b.id === selectedBankId) || bankConfigurations[0];
  const bankLimits = selectedBank.limits;
  const simulationErrors = validateSimulation(inputs, bankLimits);
  const isSimulationValid = simulationErrors.length === 0;

  // Un id de backend es un entero pequeño; el fallback local usa Date.now() (muy grande)
  const isBackendId = (id: unknown): id is number =>
    typeof id === 'number' && id < 1000000000000;

  // --- Operaciones de Historial ---
  // Clave de LocalStorage por cuenta (scoping por email): en modo offline todos los
  // logins comparten un userId simulado, por lo que el email es el discriminante real.
  const getLocalSimKey = (email?: string | null) =>
    `local_simulations_${(email || userEmail || 'anon').toLowerCase()}`;

  const loadLocalStorageHistory = () => {
    const localHistory = localStorage.getItem(getLocalSimKey());
    setHistory(localHistory ? JSON.parse(localHistory) : []);
  };

  const loadHistory = async () => {
    if (!token) return;
    try {
      const data = await loanService.getHistory(token);
      setHistory(data);
    } catch (err) {
      console.error('Error cargando historial de base de datos:', err);
      loadLocalStorageHistory();
    }
  };

  // --- Chequear estado de conexión del backend ---
  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/sign-in`, { method: 'OPTIONS' })
      .then(() => setIsBackendConnected(true))
      .catch(() => setIsBackendConnected(false));
  }, []);

  // --- Recalcular cada vez que cambian las entradas ---
  useEffect(() => {
    const loanAmount = inputs.vehiclePrice - inputs.downPayment;
    // Solo calcular cuando hay un precio y un monto a financiar válidos
    if (!inputs.vehiclePrice || inputs.vehiclePrice <= 0 || loanAmount <= 0) {
      setResults(null);
      return;
    }
    try {
      const calcResult = vehicleCreditCalculator.calculate(inputs);
      setResults(calcResult);
    } catch (e: any) {
      console.error(e.message);
      setResults(null);
    }
  }, [inputs]);

  // --- Cargar configuración y AJUSTAR (clamp) las entradas al rango del banco ---
  useEffect(() => {
    const bank = bankConfigurations.find(b => b.id === selectedBankId);
    if (!bank) return;
    const L = bank.limits;
    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

    setInputs(prev => {
      // Ajusta los campos controlados por selectores/sliders al rango del banco,
      // evitando errores de validación por valores fuera de rango al cambiar de entidad.
      const downPaymentPct = clamp(prev.downPaymentPct, L.minDownPaymentPct, L.maxDownPaymentPct);
      const residualPercentage = clamp(prev.residualPercentage, L.minResidualPct, L.maxResidualPct);
      const termMonths = L.terms.includes(prev.termMonths) ? prev.termMonths : L.terms[0];
      const gracePeriodMonths = clamp(prev.gracePeriodMonths, 0, L.maxGraceMonths);

      const next: SimulatorInputs = {
        ...prev,
        downPaymentPct,
        residualPercentage,
        termMonths,
        gracePeriodMonths,
        downPayment: roundValue(prev.vehiclePrice * (downPaymentPct / 100)),
      };

      // Solo los bancos predefinidos imponen tasas/seguros/comisiones
      if (selectedBankId !== 'custom') {
        const p = bank.config;
        next.tea = p.tea * 100;
        next.seguroDesgravamenRate = p.seguroDesgravamenRate * 100;
        next.seguroVehicularMonthly = p.seguroVehicularMonthly;
        next.portes = p.portes;
        next.gastosAdministrativos = p.gastosAdministrativos;
        next.comisionDesembolso = p.comisionDesembolso;
        next.comisionEvaluacion = p.comisionEvaluacion;
        next.cok = p.cok * 100;
      }

      return next;
    });
  }, [selectedBankId]);

  // --- Cargar historial al iniciar ---
  useEffect(() => {
    if (token) {
      loadHistory();
    } else {
      loadLocalStorageHistory();
    }
  }, [token]);

  // --- Obtener el nombre del cliente desde el endpoint de perfil ---
  useEffect(() => {
    if (!token) {
      setProfileName('');
      return;
    }
    profileService.getMyProfile(token)
      .then((data) => {
        if (!data) return;
        const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
        if (fullName) {
          setProfileName(fullName);
          // Usa el nombre del perfil como cliente de las nuevas simulaciones
          setInputs(prev => ({ ...prev, clientName: fullName }));
        }
      })
      .catch(() => { /* offline: se conserva el nombre de sesión */ });
  }, [token]);

  // --- Manejador Login Exitoso ---
  const handleAuthSuccess = (userToken: string, email: string, name: string, uId: string) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userId', uId);
    setToken(userToken);
    setUserName(name);
    setUserEmail(email);
    setUserId(uId);
    // Sincroniza el nombre del cliente con el usuario autenticado
    setInputs(prev => ({ ...prev, clientName: name }));
    navigate('/simulator');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    setToken(null);
    setUserName(null);
    setUserEmail(null);
    setUserId(null);
    setHistory([]);
    navigate('/login');
  };

  // --- Guardar / actualizar simulación ---
  const handleSaveSimulation = async () => {
    if (!results || !token) return;

    if (!isSimulationValid) {
      setSaveStatus({
        type: 'error',
        message: 'No se puede guardar: corrige las condiciones marcadas en rojo antes de continuar.'
      });
      setTimeout(() => setSaveStatus(null), 6000);
      return;
    }

    const isEditing = editingId !== null;
    setSaveStatus({
      type: 'loading',
      message: isEditing ? 'Actualizando simulación...' : 'Guardando simulación...'
    });

    const selectedBankName = selectedBankId === 'custom'
      ? 'Personalizado'
      : bankConfigurations.find(b => b.id === selectedBankId)?.name || 'Desconocido';

    try {
      if (isEditing) {
        await loanService.updateCredit(token, editingId!, inputs, selectedBankName, results);
        setSaveStatus({ type: 'success', message: 'Simulación actualizada exitosamente.' });
      } else {
        await loanService.saveCredit(token, inputs, selectedBankName, results);
        setSaveStatus({ type: 'success', message: 'Simulación guardada exitosamente.' });
      }
      loadHistory();
    } catch (err) {
      console.error('Error al guardar en base de datos:', err);
      
      if (isBackendConnected) {
        setSaveStatus({ 
          type: 'error', 
          message: 'Error de validación del Crédito en el servidor. Verifique si se incumplen las políticas de riesgo del banco (LTV > 90%, Cuota inicial < 10% del precio, o Relación Cuota/Ingreso > 40%).' 
        });
      } else {
        // Fallback localstorage (scoped por cuenta/email)
        const localSimulations = localStorage.getItem(getLocalSimKey());
        const sims = localSimulations ? JSON.parse(localSimulations) : [];
        const newSim = {
          id: Date.now(),
          ownerEmail: userEmail,
          clientName: inputs.clientName,
          vehicleBrand: inputs.vehicleBrand,
          vehicleModel: inputs.vehicleModel,
          vehiclePrice: inputs.vehiclePrice,
          downPayment: inputs.downPayment,
          loanAmount: results.loanAmount,
          interestRate: inputs.tea,
          rateType: 'EFFECTIVE',
          termMonths: inputs.termMonths,
          gracePeriodMonths: inputs.gracePeriodMonths,
          gracePeriodType: inputs.gracePeriodMonths > 0 ? inputs.gracePeriodType : 'TOTAL',
          currency: 'PEN',
          bankName: selectedBankName,
          tcea: results.tcea,
          npv: results.npv,
          irr: results.irr,
          totalPaid: results.totalPaid,
          totalInterestPaid: results.totalInterestPaid,
          fixedInstallment: results.fixedInstallment,
          residualValue: results.residualValue,
          residualPercentage: inputs.residualPercentage,
          seguroDesgravamenRate: inputs.seguroDesgravamenRate,
          seguroVehicularMonthly: inputs.seguroVehicularMonthly,
          portes: inputs.portes,
          gastosAdministrativos: inputs.gastosAdministrativos,
          comisionDesembolso: inputs.comisionDesembolso,
          comisionEvaluacion: inputs.comisionEvaluacion,
          cok: inputs.cok,
          createdAt: new Date().toISOString()
        };
        
        sims.unshift(newSim);
        localStorage.setItem(getLocalSimKey(), JSON.stringify(sims));
        setHistory(sims);
        
        setSaveStatus({ 
          type: 'success', 
          message: 'Simulación guardada localmente (Local Storage) debido a desconexión del servidor.' 
        });
      }
    }

    setTimeout(() => setSaveStatus(null), 8000);
  };

  // --- Cargar simulación del historial ---
  const handleSelectHistory = async (sim: any) => {
    setSelectedHistoryId(sim.id);
    
    // Rellenar entradas del simulador
    setInputs({
      clientName: sim.clientName || 'Cliente',
      vehicleBrand: sim.vehicleBrand || 'Marca',
      vehicleModel: sim.vehicleModel || 'Modelo',
      vehiclePrice: sim.vehiclePrice || 80000,
      downPayment: sim.downPayment || 16000,
      downPaymentPct: roundValue(((sim.downPayment || 16000) / (sim.vehiclePrice || 80000)) * 100),
      tea: sim.interestRate || sim.tea || 10,
      termMonths: sim.termMonths || 24,
      gracePeriodMonths: sim.gracePeriodMonths || 0,
      gracePeriodType: sim.gracePeriodType === 'PARTIAL' ? 'PARTIAL' : 'TOTAL',
      residualPercentage: sim.residualPercentage || 40,
      seguroDesgravamenRate: sim.seguroDesgravamenRate || 0.05,
      seguroVehicularMonthly: sim.seguroVehicularMonthly || 150,
      portes: sim.portes || 15,
      gastosAdministrativos: sim.gastosAdministrativos || 30,
      comisionDesembolso: sim.comisionDesembolso || 500,
      comisionEvaluacion: sim.comisionEvaluacion || 265,
      cok: sim.cok || 10.0,
    });

    // Detectar banco
    const bank = bankConfigurations.find(b => b.name.toLowerCase() === (sim.bankName || '').toLowerCase());
    if (bank) {
      setSelectedBankId(bank.id);
    } else {
      setSelectedBankId('custom');
    }

    // El cronograma y los indicadores se recalculan en el frontend a partir de las
    // entradas cargadas (fuente de verdad), garantizando consistencia con lo guardado.
  };

  const handleLoadIntoSimulator = (sim: any) => {
    handleSelectHistory(sim);
    // Si proviene del backend, se activa el modo edición para actualizar ese registro
    setEditingId(isBackendId(sim.id) ? sim.id : null);
    navigate('/simulator');
  };

  const handleProfileSave = (newFullName: string) => {
    localStorage.setItem('userName', newFullName);
    setUserName(newFullName);
    setInputs(prev => ({
      ...prev,
      clientName: newFullName
    }));
  };

  const fmtCurrency = (val: number) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(val);
  };

  // --- VISTA DE LOGIN/REGISTRO ---
  if (!token) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden text-on-surface" style={{ padding: '2rem 1rem' }}>
        {/* Glows */}
        <div className="ambient-glow -top-20 -left-20"></div>
        <div className="ambient-glow -bottom-20 -right-20" style={{ background: 'radial-gradient(circle, rgba(73, 75, 214, 0.15) 0%, transparent 70%)' }}></div>

        <div className="w-full max-w-md glass-card p-8 flex flex-col items-center relative z-10">
          <Routes>
            <Route 
              path="/login" 
              element={
                <LoginForm 
                  onSuccess={handleAuthSuccess}
                  onToggleRegister={() => navigate('/register')}
                  isBackendConnected={isBackendConnected}
                />
              } 
            />
            <Route 
              path="/register" 
              element={
                <RegisterForm 
                  onSuccess={() => navigate('/login')}
                  onToggleLogin={() => navigate('/login')}
                  isBackendConnected={isBackendConnected}
                />
              } 
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>

        {/* Server Status Banner */}
        <footer className="fixed bottom-0 left-0 w-full server-banner py-3 px-6 z-20" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}>
          <div className="max-w-container-max mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isBackendConnected ? 'bg-positive-emerald' : 'bg-warning-yellow'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isBackendConnected ? 'bg-positive-emerald' : 'bg-warning-yellow'}`}></span>
                </span>
                <span className={`font-label-bold text-label-bold uppercase tracking-widest text-[10px] ${isBackendConnected ? 'text-positive-emerald' : 'text-warning-yellow'}`} style={{ fontSize: '10px', fontWeight: 'bold' }}>
                  {isBackendConnected ? 'Servidores Operativos' : 'Modo Demostración / Offline'}
                </span>
              </div>
              <div className="hidden md:block h-4 w-px bg-white/10" style={{ height: '16px', width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
              <p className="hidden md:block text-body-sm text-on-surface-variant opacity-70">
                {isBackendConnected ? 'Base de datos PostgreSQL conectada (Puerto 8082)' : 'Usando LocalStorage local para simulaciones'}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-label-bold text-on-surface-variant flex items-center gap-1 text-xs" style={{ fontWeight: 'bold', fontSize: '12px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>security</span>
                <span>SBS Transparencia</span>
              </span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // --- VISTA DE DASHBOARD PRINCIPAL ---
  return (
    <div className="min-h-screen">
      {/* TopNavBar (Anchored header that always follows the user) */}
      <nav className={`top-nav ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="flex items-center gap-4 logo-mobile-only">
          <span 
            onClick={() => navigate('/simulator')} 
            className="text-headline-md text-secondary cursor-pointer bold"
          >
            TURBOCREDIT
          </span>
        </div>
        
        <div className="flex items-center gap-4" style={{ marginLeft: 'auto',minWidth:0 }}>
          {userName && (
              <span
                  className="text-body-sm text-slate-300 font-bold"
                  style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'160px'}}
              >
                Hola, {userName}
              </span>
          )}
          <button 
            onClick={() => navigate('/profile')}
            className="btn-secondary px-4 py-2 text-body-sm flex items-center gap-2"
            title="Ver Perfil"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>person</span>
            <span className="text-body-sm">Perfil</span>
          </button>
        </div>
      </nav>

      <div className="flex">
        {/* SideNavBar (Desktop) */}
        <aside className={`side-nav ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="mb-6 flex items-center gap-3 side-brand">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '30px', fontVariationSettings: "'FILL' 1" }}>speed</span>
            <div className="side-brand-text">
              <h3 className="text-headline-md text-white uppercase tracking-tight" style={{ fontSize: '1.25rem', fontWeight: 900 }}>TurboCredit</h3>
              <p className="text-body-sm text-outline uppercase tracking-widest" style={{ fontSize: '10px' }}>Financial Intel</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            <button
              onClick={() => navigate('/simulator')}
              className={`nav-link ${location.pathname === '/simulator' ? 'active' : ''}`}
              title="Simulador"
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span>Simulador</span>
            </button>
            <button
              onClick={() => navigate('/history')}
              className={`nav-link ${location.pathname === '/history' ? 'active' : ''}`}
              title="Historial Reciente"
            >
              <span className="material-symbols-outlined">history</span>
              <span>Historial Reciente</span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
              title="Perfil"
            >
              <span className="material-symbols-outlined">person</span>
              <span>Perfil</span>
            </button>
          </nav>

          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="nav-link"
              style={{ color: '#f43f5e' }}
              title="Cerrar Sesión"
            >
              <span className="material-symbols-outlined">logout</span>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={`app-wrapper ${sidebarCollapsed ? 'collapsed' : ''}`}>
          {/* Atmospheric Glow Background */}
          <div className="ambient-glow glow-top-left"></div>
          <div className="ambient-glow glow-bottom-right"></div>

          <div className="max-w-container-max relative z-10 pb-8">
            <Routes>
              <Route 
                path="/simulator" 
                element={
                  <div className="flex flex-col gap-6">
                    <header>
                      <h1 className="text-headline-lg font-bold text-white m-0" style={{ fontSize: '2rem' }}>Simulador de Crédito Vehicular</h1>
                      <p className="text-body-sm text-slate-400 mt-2">Analiza y proyecta tu inversión con precisión financiera bajo el método de Compra Inteligente.</p>
                    </header>

                    {/* Formularios de entrada */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                      <div className="flex flex-col gap-6">
                        <BankSelector
                          selectedBankId={selectedBankId}
                          onSelectBank={setSelectedBankId}
                        />
                        <VehicleForm
                          inputs={inputs}
                          onChangeInputs={setInputs}
                        />
                      </div>
                      <FinancialForm
                        inputs={inputs}
                        onChangeInputs={setInputs}
                        onSelectCustomBank={() => setSelectedBankId('custom')}
                        limits={bankLimits}
                        errors={simulationErrors}
                      />
                    </div>

                    {/* Resultados (debajo de los formularios) */}
                    {results ? (
                      <MetricsPanel results={results} />
                    ) : (
                      <div className="glass-panel p-6 rounded-3xl text-center text-slate-400 text-sm">
                        Ingresa el precio del vehículo y la cuota inicial para ver los indicadores calculados (TCEA, VAN, TIR...).
                      </div>
                    )}

                    {/* GUARDAR SIMULACIÓN BANNER */}
                    <div className="flex justify-between items-center glass-panel p-6 rounded-3xl gap-4" style={{ flexWrap: 'wrap' }}>
                      <div className="text-sm">
                        <span className="text-slate-400 block uppercase font-bold tracking-wider mb-1" style={{ fontSize: '10px' }}>Monto del Préstamo a Financiar</span>
                        <strong className="text-white text-lg font-bold" style={{ fontSize: '1.25rem' }}>{fmtCurrency(Math.max(0, inputs.vehiclePrice - inputs.downPayment))}</strong>
                        {editingId !== null && (
                          <span className="flex items-center gap-2 mt-2 text-xs" style={{ color: '#8083ff' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                            Editando simulación guardada
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="underline opacity-80 hover:opacity-100"
                            >
                              (crear una nueva)
                            </button>
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveSimulation}
                        disabled={!results || !isSimulationValid}
                        className="btn-primary-gradient px-6 py-3 flex items-center justify-center gap-2"
                        style={{ fontSize: '0.75rem', opacity: (results && isSimulationValid) ? 1 : 0.5, cursor: (results && isSimulationValid) ? 'pointer' : 'not-allowed' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>save</span>
                        <span>{editingId !== null ? 'Actualizar Simulación' : 'Guardar Simulación'}</span>
                      </button>
                    </div>

                    {saveStatus && (
                      <Alert type={saveStatus.type === 'loading' ? 'info' : saveStatus.type}>
                        {saveStatus.message}
                      </Alert>
                    )}

                    {results && (
                      <ScheduleTable
                        results={results}
                        termMonths={inputs.termMonths}
                        gracePeriodMonths={inputs.gracePeriodMonths}
                        residualPercentage={inputs.residualPercentage}
                      />
                    )}
                  </div>
                } 
              />
              <Route 
                path="/history" 
                element={
                  <HistoryView
                    history={history}
                    selectedHistoryId={selectedHistoryId}
                    onSelectHistory={handleSelectHistory}
                    onLoadIntoSimulator={handleLoadIntoSimulator}
                    fallbackClientName={profileName || userName || ''}
                  />
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProfileForm
                    token={token}
                    userEmail={userEmail || ''}
                    onProfileSave={handleProfileSave}
                  />
                } 
              />
              <Route path="*" element={<Navigate to="/simulator" replace />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="bottom-nav">
        <button 
          onClick={() => navigate('/simulator')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            location.pathname === '/simulator' ? 'text-secondary' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined" style={location.pathname === '/simulator' ? { fontVariationSettings: "'FILL' 1" } : undefined}>dashboard</span>
          <span className="text-[10px] font-label-bold uppercase" style={{ fontSize: '10px', fontWeight: 'bold' }}>Simulador</span>
        </button>
        <button 
          onClick={() => navigate('/history')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            location.pathname === '/history' ? 'text-secondary' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined" style={location.pathname === '/history' ? { fontVariationSettings: "'FILL' 1" } : undefined}>history</span>
          <span className="text-[10px] font-label-bold uppercase" style={{ fontSize: '10px', fontWeight: 'bold' }}>Historial</span>
        </button>
        <button 
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            location.pathname === '/profile' ? 'text-secondary' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined" style={location.pathname === '/profile' ? { fontVariationSettings: "'FILL' 1" } : undefined}>person</span>
          <span className="text-[10px] font-label-bold uppercase" style={{ fontSize: '10px', fontWeight: 'bold' }}>Perfil</span>
        </button>
      </nav>
    </div>
  );
}
