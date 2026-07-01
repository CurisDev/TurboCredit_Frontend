const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export const cloudinaryService = {
  isConfigured: (): boolean => Boolean(CLOUD_NAME && UPLOAD_PRESET),

  // Sube una imagen a Cloudinary (upload sin firmar) y devuelve la secure_url
  uploadImage: async (file: File): Promise<string> => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error(
        'Cloudinary no está configurado. Define VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET en el archivo .env.'
      );
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Error al subir la imagen a Cloudinary.');
    }

    const data = await response.json();
    return data.secure_url as string;
  },
};
