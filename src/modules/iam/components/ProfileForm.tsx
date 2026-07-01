import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { profileService, type ProfileData } from '../services/profileService';
import { cloudinaryService } from '../services/cloudinaryService';

interface ProfileFormProps {
  token: string;
  userEmail: string;
  onProfileSave: (fullName: string) => void;
}

export function ProfileForm({ token, userEmail, onProfileSave }: ProfileFormProps) {
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    profileImageUrl: ''
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar perfil existente al montar
  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        const data = await profileService.getMyProfile(token);
        if (data) {
          setProfile({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            profileImageUrl: data.profileImageUrl || ''
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
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await profileService.saveProfile(token, profile);
      const fullName = `${profile.firstName} ${profile.lastName}`.trim();
      onProfileSave(fullName || 'Usuario');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al guardar el perfil en el servidor.');
    } finally {
      setSaving(false);
    }
  };

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Permite volver a elegir el mismo archivo más adelante
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('El archivo seleccionado no es una imagen válida.');
      return;
    }
    // Límite de 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen supera el límite de 5 MB.');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const url = await cloudinaryService.uploadImage(file);
      setProfile(prev => ({ ...prev, profileImageUrl: url }));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'No se pudo subir la imagen.');
    } finally {
      setUploading(false);
    }
  };

  const getProfileCompletion = () => {
    const fields = [profile.firstName, profile.lastName, profile.profileImageUrl];
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
  const avatarSrc = profile.profileImageUrl?.trim()
    ? profile.profileImageUrl
    : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.firstName || 'MC')}&backgroundColor=494bd6`;

  return (
    <div className="w-full relative">
      <header className="mb-8">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Configuración del Perfil</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">
          Mantén tu información personal actualizada.
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
            </div>
          </section>

          {/* Sección 2: Contacto */}
          <section className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">alternate_email</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Contacto</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
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
            </div>
          </section>

          {/* Sección 3: Imagen de Perfil */}
          <section className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-tertiary text-3xl">image</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Imagen de Perfil</h2>
            </div>

            {/* Input de archivo oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            <div className="flex items-center gap-6">
              {/* Previsualización */}
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)', flexShrink: 0, backgroundColor: '#0b1220' }}>
                <img
                  alt="Vista previa"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  src={avatarSrc}
                />
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handlePickImage}
                  disabled={uploading}
                  className="btn-secondary px-5 py-3 flex items-center justify-center gap-2 w-fit"
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      <span>Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload</span>
                      <span>{profile.profileImageUrl ? 'Cambiar fotografía' : 'Seleccionar fotografía'}</span>
                    </>
                  )}
                </button>
                <p className="text-outline text-xs italic leading-relaxed">
                  Elige una imagen (JPG o PNG, máx. 5 MB). Se subirá a Cloudinary automáticamente.
                </p>
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
                  src={avatarSrc}
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
                TurboCredit utiliza encriptación de grado bancario (AES-256) para proteger tu información personal.
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
