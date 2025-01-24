const cloudinary = require('cloudinary').v2;

// Configuration initiale de Cloudinary avec les variables d'environnement
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuration des options par défaut pour l'optimisation des images
const defaultOptions = {
  use_filename: true,
  unique_filename: true,
  overwrite: true,
  resource_type: "auto",
  transformation: [
    { width: 1000, crop: "limit" },
    { quality: "auto" },
    { fetch_format: "auto" }
  ]
};

// Fonction pour le téléchargement des fichiers
const uploadFile = async (file, folder) => {
  try {
    const uploadOptions = {
      ...defaultOptions,
      folder: `locoto/${folder}`
    };

    const result = await cloudinary.uploader.upload(file, uploadOptions);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resource_type
    };
  } catch (error) {
    console.error('Erreur lors du téléchargement sur Cloudinary:', error);
    throw new Error(`Échec du téléchargement du fichier: ${error.message}`);
  }
};

// Fonction pour la suppression des fichiers
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Erreur lors de la suppression sur Cloudinary:', error);
    throw new Error(`Échec de la suppression du fichier: ${error.message}`);
  }
};

// Fonction pour la suppression en masse
const deleteManyFiles = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error('Erreur lors de la suppression multiple sur Cloudinary:', error);
    throw new Error(`Échec de la suppression des fichiers: ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  uploadFile,
  deleteFile,
  deleteManyFiles
};