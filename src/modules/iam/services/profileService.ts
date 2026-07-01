const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082/api/v1';

export interface ProfileData {
  firstName: string;
  lastName: string;
  profileImageUrl: string;
}

export const profileService = {
  // Obtiene el perfil del usuario autenticado (GET /users/me)
  getMyProfile: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Error al cargar el perfil del servidor.');
    }

    return response.json(); // { id, email, firstName, lastName, profileImageUrl, roles }
  },

  // Actualiza nombre, apellido e imagen de perfil (PUT /users/me)
  saveProfile: async (token: string, profileData: ProfileData) => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      throw new Error('Error al guardar el perfil del cliente.');
    }

    return response.json();
  }
};
