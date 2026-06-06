const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082/api/v1';

export const authService = {
  signIn: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error al iniciar sesión.');
    }

    return response.json(); // Retorna { token, email, id, fullName, roles }
  },

  signUp: async (email: string, password: string, fullName: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/sign-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        fullName,
        roles: ['ROLE_USER']
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error al registrarse.');
    }

    return response.json();
  }
};
