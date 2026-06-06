import { useState, type FormEvent } from 'react';
import { authService } from '../services/authService';

interface RegisterFormProps {
  onSuccess: () => void;
  onToggleLogin: () => void;
  isBackendConnected: boolean;
}

export function RegisterForm({ onSuccess, onToggleLogin, isBackendConnected }: RegisterFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isBackendConnected) {
        await authService.signUp(email, password, fullName);
        onSuccess();
      } else {
        // Fallback offline (simulado)
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error en el registro. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Logo Section */}
      <div className="mb-8 text-center">
        <div className="w-24 h-24 mb-4 mx-auto p-2 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
          <img
            alt="TurboCredit Logo"
            className="w-full h-full object-contain"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdhg8bROqj95IP6opXG7nLTUHfgkypZlmAI2Sx3LsPrBOM1bUPWLvo7bHHler5DjmQyMyG_dksBLP2CpGAHmHHKf0R6ciBFQ2Qds8AqH_Li0VrR1zI3dr8U7UBIM3cGIhx5m8i9JQCvojzFkoNEHEF7ajZBWDwtGqkub9B8B9woY7RW5-BXzVN0YIJclR0thbR3sPj7l40n-MZgdkk1WI0lBPEHsG9pZLPwHbD4LIEkZkZwcau4oHTXKvPyP2pdACkwHI"
          />
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-1">
          Crear Cuenta
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Regístrate para simular planes de crédito vehicular
        </p>
      </div>

      {error && (
        <div className="w-full mb-6 p-4 rounded-xl border border-rose-500/25 bg-rose-500/10 text-rose-300 text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        {/* Full Name Field */}
        <div className="space-y-2">
          <label className="font-label-bold text-label-bold text-on-surface-variant block ml-1" htmlFor="fullname">
            Nombre Completo
          </label>
          <div className="luminous-input flex items-center px-4 py-3 rounded-xl gap-3 group">
            <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors" style={{ fontSize: '20px' }}>
              person
            </span>
            <input
              className="bg-transparent border-none focus:ring-0 text-on-surface font-body-md text-body-md w-full placeholder:text-outline/50 outline-none"
              id="fullname"
              placeholder="Juan Pérez"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label className="font-label-bold text-label-bold text-on-surface-variant block ml-1" htmlFor="email">
            Correo Electrónico
          </label>
          <div className="luminous-input flex items-center px-4 py-3 rounded-xl gap-3 group">
            <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors" style={{ fontSize: '20px' }}>
              mail
            </span>
            <input
              className="bg-transparent border-none focus:ring-0 text-on-surface font-body-md text-body-md w-full placeholder:text-outline/50 outline-none"
              id="email"
              placeholder="nombre@empresa.com"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="font-label-bold text-label-bold text-on-surface-variant block ml-1" htmlFor="password">
            Contraseña
          </label>
          <div className="luminous-input flex items-center px-4 py-3 rounded-xl gap-3 group">
            <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors" style={{ fontSize: '20px' }}>
              lock
            </span>
            <input
              className="bg-transparent border-none focus:ring-0 text-on-surface font-body-md text-body-md w-full placeholder:text-outline/50 outline-none"
              id="password"
              placeholder="••••••••"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          className="btn-primary-gradient w-full py-4 rounded-xl font-label-bold text-label-bold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Creando Cuenta...</span>
            </>
          ) : (
            <>
              <span>Registrarse</span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                app_registration
              </span>
            </>
          )}
        </button>
      </form>

      {/* Registration Footer */}
      <div className="mt-8 pt-6 border-t border-white/5 w-full text-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          ¿Ya tienes una cuenta?
          <button
            onClick={onToggleLogin}
            className="font-label-bold text-label-bold text-secondary hover:underline ml-1 bg-transparent border-none cursor-pointer"
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
}
