/**
 * Service de gestion du stockage des images de tickets
 * Utilise localStorage avec compression pour optimiser l'espace
 */

const STORAGE_KEY_PREFIX = 'receipt_image_';

/**
 * Compresse une image base64 pour réduire sa taille
 */
export async function compressImage(base64Image: string, maxSizeKB: number = 500): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Calculer les nouvelles dimensions (max 1200px de largeur)
      const maxWidth = 1200;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Dessiner l'image redimensionnée
      ctx.drawImage(img, 0, 0, width, height);

      // Essayer différentes qualités de compression
      let quality = 0.9;
      let compressedImage = canvas.toDataURL('image/jpeg', quality);

      // Réduire la qualité jusqu'à atteindre la taille cible
      while (compressedImage.length > maxSizeKB * 1024 && quality > 0.1) {
        quality -= 0.1;
        compressedImage = canvas.toDataURL('image/jpeg', quality);
      }

      resolve(compressedImage);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = base64Image;
  });
}

/**
 * Sauvegarde une image dans localStorage
 * Retourne l'ID de l'image sauvegardée
 */
export async function saveReceiptImage(base64Image: string): Promise<string> {
  try {
    // Compresser l'image
    const compressedImage = await compressImage(base64Image);

    // Générer un ID unique
    const imageId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const storageKey = STORAGE_KEY_PREFIX + imageId;

    // Sauvegarder dans localStorage
    localStorage.setItem(storageKey, compressedImage);

    return imageId;
  } catch (error) {
    console.error('Error saving receipt image:', error);
    throw error;
  }
}

/**
 * Récupère une image depuis localStorage
 */
export function getReceiptImage(imageId: string): string | null {
  try {
    const storageKey = STORAGE_KEY_PREFIX + imageId;
    return localStorage.getItem(storageKey);
  } catch (error) {
    console.error('Error getting receipt image:', error);
    return null;
  }
}

/**
 * Supprime une image de localStorage
 */
export function deleteReceiptImage(imageId: string): void {
  try {
    const storageKey = STORAGE_KEY_PREFIX + imageId;
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Error deleting receipt image:', error);
  }
}

/**
 * Nettoie les images orphelines (non associées à des dépenses)
 */
export function cleanupOrphanedImages(activeImageIds: string[]): void {
  try {
    const allKeys = Object.keys(localStorage);
    const imageKeys = allKeys.filter(key => key.startsWith(STORAGE_KEY_PREFIX));

    for (const key of imageKeys) {
      const imageId = key.replace(STORAGE_KEY_PREFIX, '');
      if (!activeImageIds.includes(imageId)) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error('Error cleaning up orphaned images:', error);
  }
}

/**
 * Obtient la taille totale utilisée par les images dans localStorage
 */
export function getImagesStorageSize(): number {
  try {
    let totalSize = 0;
    const allKeys = Object.keys(localStorage);
    const imageKeys = allKeys.filter(key => key.startsWith(STORAGE_KEY_PREFIX));

    for (const key of imageKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += value.length;
      }
    }

    return totalSize;
  } catch (error) {
    console.error('Error calculating images storage size:', error);
    return 0;
  }
}
