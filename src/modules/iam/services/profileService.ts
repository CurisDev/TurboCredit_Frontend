const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082/api/v1';

export interface ProfileData {
  firstName: string;
  lastName: string;
  documentId: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phoneCountryCode: string;
  phoneNumber: string;
  monthlyIncome: number;
  employmentStatus: string;
}

export const profileService = {
  getProfileByUserId: async (token: string, userId: string) => {
    const response = await fetch(`${API_BASE_URL}/profiles/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    });

    if (response.status === 404) {
      return null; // El usuario no tiene perfil creado aún
    }

    if (!response.ok) {
      throw new Error('Error al cargar el perfil del servidor.');
    }

    return response.json();
  },

  saveProfile: async (token: string, profileData: ProfileData) => {
    const response = await fetch(`${API_BASE_URL}/profiles`, {
      method: 'POST',
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
