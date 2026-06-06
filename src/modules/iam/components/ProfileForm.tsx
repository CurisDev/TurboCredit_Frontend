import { useState, useEffect, type FormEvent } from 'react';
import { profileService, type ProfileData } from '../services/profileService';

interface ProfileFormProps {
  token: string;
  userId: string;
  userEmail: string;
  onProfileSave: (fullName: string, monthlyIncome: number) => void;
}

export function ProfileForm({ token, userId, userEmail, onProfileSave }: ProfileFormProps) {
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    documentId: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'Perú',
    phoneCountryCode: '+51',
    phoneNumber: '',
    monthlyIncome: 6500,
    employmentStatus: 'Planilla / Dependiente'
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar perfil existente al montar
  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        const data = await profileService.getProfileByUserId(token, userId);
        if (data) {
          setProfile({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            documentId: data.documentId?.documentId || data.documentId || '',
            street: data.address?.street || data.street || '',
            city: data.address?.city || data.city || '',
            postalCode: data.address?.postalCode || data.postalCode || '',
            country: data.address?.country || data.country || 'Perú',
            phoneCountryCode: data.phoneNumber?.phoneCountryCode || data.phoneCountryCode || '+51',
            phoneNumber: data.phoneNumber?.phoneNumber || data.phoneNumber || '',
            monthlyIncome: data.monthlyIncome || 6500,
            employmentStatus: data.employmentStatus || 'Planilla / Dependiente'
          });
        }
      } catch (err) {
        console.error('Error cargando perfil:', err);
        setError('No se pudo conectar con el servidor para cargar el perfil. Se utilizarán datos locales.');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [token, userId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await profileService.saveProfile(token, profile);
      const fullName = `${profile.firstName} ${profile.lastName}`.trim();
      onProfileSave(fullName || 'Usuario', profile.monthlyIncome);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al guardar el perfil en el servidor.');
    } finally {
      setSaving(false);
    }
  };

  const getProfileCompletion = () => {
    const fields = [
      profile.firstName,
      profile.lastName,
      profile.documentId,
      profile.street,
      profile.city,
      profile.phoneNumber,
    ];
    const filled = fields.filter(f => f.trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  };

  if (loading) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-slate-400 text-sm">Cargando perfil del servidor...</span>
      </div>
    );
  }

  const completionPct = getProfileCompletion();

  return (
    <div className="w-full relative">
      <header className="mb-8">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Configuración del Perfil</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">
          Mantén tu información actualizada para obtener simulaciones de crédito más precisas.
        </p>
      </header>

      {error && (
        <div className="w-full mb-6 p-4 rounded-xl border border-rose-500/25 bg-rose-500/10 text-rose-300 text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">error</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-8">
        {/* Left Column: Form Sections */}
        <div className="col-span-8 flex flex-col gap-6">
          {/* Sección 1: Datos Personales */}
          <section className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-secondary text-3xl">account_circle</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Datos Personales</h2>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="form-group">
                <label className="font-label-bold text-label-bold text-outline">Nombres</label>
                <div className="luminous-input flex items-center pl-4">
                  <span className="material-symbols-outlined text-outline">person</span>
                  <input
                    placeholder="Ingresa tus nombres"
                    type="text"
                    required
                    value={profile.firstName}
                    onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="font-label-bold text-label-bold text-outline">Apellidos</label>
                <div className="luminous-input flex items-center pl-4">
                  <span className="material-symbols-outlined text-outline">badge</span>
                  <input
                    placeholder="Ingresa tus apellidos"
                    type="text"
                    required
                    value={profile.lastName}
                    onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="font-label-bold text-label-bold text-outline">Documento de Identidad</label>
                <div className="luminous-input flex items-center pl-4">
                  <span className="material-symbols-outlined text-outline">fingerprint</span>
                  <input
                    placeholder="DNI (8 dígitos)"
                    type="text"
                    maxLength={8}
                    required
                    value={profile.documentId}
                    onChange={(e) => setProfile(prev => ({ ...prev, documentId: e.target.value.replace(/\D/g, '') }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="font-label-bold text-label-bold text-outline">Fecha de Nacimiento (Opcional)</label>
                <div className="luminous-input flex items-center pl-4">
                  <span className="material-symbols-outlined text-outline">calendar_today</span>
                  <input
                    type="date"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Sección 2: Contacto */}
          <section className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">alternate_email</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Contacto</h2>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="form-group">
                <label className="font-label-bold text-label-bold text-outline">Correo Electrónico</label>
                <div className="luminous-input flex items-center pl-4 opacity-60">
                  <span className="material-symbols-outlined text-outline">mail</span>
                  <input
                    type="email"
                    disabled
                    value={userEmail}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="font-label-bold text-label-bold text-outline">Teléfono Móvil</label>
                <div className="luminous-input flex items-center pl-4">
                  <span className="material-symbols-outlined text-outline">phone_iphone</span>
                  <input
                    placeholder="999 999 999"
                    type="tel"
                    required
                    value={profile.phoneNumber}
                    onChange={(e) => setProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>
              </div>
              <div className="col-span-2 form-group">
                <label className="font-label-bold text-label-bold text-outline">Dirección de Domicilio</label>
                <div className="luminous-input flex items-center pl-4">
                  <span className="material-symbols-outlined text-outline">location_on</span>
                  <input
                    placeholder="Calle, Número, Distrito"
                    type="text"
                    required
                    value={profile.street}
                    onChange={(e) => setProfile(prev => ({ ...prev, street: e.target.value }))}
                  />
                </div>
              </div>
              <div className="col-span-2 grid grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="font-label-bold text-label-bold text-outline">Ciudad</label>
                  <div className="luminous-input flex items-center">
                    <input
                      placeholder="Lima"
                      type="text"
                      required
                      value={profile.city}
                      onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="font-label-bold text-label-bold text-outline">Cód. Postal</label>
                  <div className="luminous-input flex items-center">
                    <input
                      placeholder="15001"
                      type="text"
                      required
                      value={profile.postalCode}
                      onChange={(e) => setProfile(prev => ({ ...prev, postalCode: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="font-label-bold text-label-bold text-outline">País</label>
                  <div className="luminous-input flex items-center">
                    <input
                      placeholder="Perú"
                      type="text"
                      required
                      value={profile.country}
                      onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Sección 3: Situación Financiera */}
          <section className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-tertiary text-3xl">payments</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Situación Financiera</h2>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="form-group">
                <label className="font-label-bold text-label-bold text-outline">Ingresos Mensuales Netos (S/.)</label>
                <div className="luminous-input flex items-center pl-4">
                  <span className="material-symbols-outlined text-outline">payments</span>
                  <input
                    placeholder="0.00"
                    type="number"
                    required
                    min={1}
                    value={profile.monthlyIncome}
                    onChange={(e) => setProfile(prev => ({ ...prev, monthlyIncome: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="font-label-bold text-label-bold text-outline">Tipo de Contrato / Trabajo</label>
                <div className="luminous-input flex items-center pl-4">
                  <span className="material-symbols-outlined text-outline">work</span>
                  <select
                    className="w-full bg-transparent border-none text-on-surface focus:ring-0 py-3 px-4 font-body-md outline-none appearance-none cursor-pointer"
                    value={profile.employmentStatus}
                    onChange={(e) => setProfile(prev => ({ ...prev, employmentStatus: e.target.value }))}
                  >
                    <option className="bg-slate-950 text-white" value="Planilla / Dependiente">Planilla / Dependiente</option>
                    <option className="bg-slate-950 text-white" value="Independiente">Independiente</option>
                    <option className="bg-slate-950 text-white" value="Empresario">Empresario</option>
                    <option className="bg-slate-950 text-white" value="Desempleado">Desempleado</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Profile Summary & CTA */}
        <div className="col-span-4 flex flex-col gap-6">
          <div className="glass-card p-8 sticky overflow-hidden" style={{ top: '96px' }}>
            <div className="text-center mb-8 relative">
              <div className="relative inline-block" style={{ width: '96px', height: '96px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #4edea3', padding: '4px', margin: '0 auto 1rem' }}>
                <img
                  alt="Profile Large"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.firstName || 'MC')}&backgroundColor=494bd6`}
                />
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                {profile.firstName || profile.lastName ? `${profile.firstName} ${profile.lastName}` : 'Nombre Cliente'}
              </h3>
              <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: 'rgba(78, 222, 163, 0.1)', border: '1px solid rgba(78, 222, 163, 0.2)', color: '#4edea3', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.5rem' }}>
                Usuario Activo
              </span>
            </div>

            <div className="flex flex-col gap-4 mb-8">
              <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span className="text-on-surface-variant font-body-sm">Perfil completado</span>
                <span className="text-secondary font-label-bold">{completionPct}%</span>
              </div>
              <div style={{ width: '100%', backgroundColor: '#1e293b', borderRadius: '50px', height: '6px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: '#4edea3', height: '100%', width: `${completionPct}%`, transition: 'width 0.5s ease' }}></div>
              </div>
              <p className="text-outline text-xs text-center italic leading-relaxed">
                Completa tu situación financiera detallada para desbloquear tasas preferenciales y pasar la evaluación del banco.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <button
                className="btn-primary w-full py-4 text-center flex items-center justify-center gap-2"
                type="submit"
                disabled={saving}
              >
                <span className="material-symbols-outlined">save</span>
                <span>{saving ? 'Guardando...' : 'Guardar Perfil'}</span>
              </button>
            </div>
          </div>

          {/* Security Info Card */}
          <div className="glass-card p-6 flex gap-4 items-start" style={{ borderLeft: '4px solid #10b981' }}>
            <span className="material-symbols-outlined text-positive-emerald">verified_user</span>
            <div>
              <h4 className="font-label-bold text-label-bold text-on-surface text-sm">Tus datos están seguros</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 text-xs leading-relaxed">
                TurboCredit utiliza encriptación de grado bancario (AES-256) para proteger tu información personal y financiera de acuerdo a ley.
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Success Feedback Toast */}
      <div
        className={`fixed bottom-10 right-10 z-[100] transform transition-all duration-500 ${
          showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        <div className="glass-card border-positive-emerald bg-slate-900/90 rounded-xl px-6 py-4 flex items-center gap-4 shadow-2xl">
          <div className="h-10 w-10 bg-positive-emerald rounded-full flex items-center justify-center text-slate-950 font-bold">
            <span className="material-symbols-outlined">check</span>
          </div>
          <div>
            <p className="font-label-bold text-label-bold text-on-surface text-sm">¡Perfil Actualizado!</p>
            <p className="text-xs text-on-surface-variant">Tus cambios se han guardado con éxito en el servidor.</p>
          </div>
          <button className="ml-4 text-outline hover:text-on-surface cursor-pointer" onClick={() => setShowToast(false)}>
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
