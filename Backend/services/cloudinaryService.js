const cloudinary = require('cloudinary').v2;

/**
 * Configure Cloudinary with environment variables
 * CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload an image buffer to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer from multer memoryStorage
 * @param {string} folder - Cloudinary folder to upload into
 * @returns {Promise<Object>} Cloudinary upload result with secure_url, public_id, etc.
 */
const uploadImage = (fileBuffer, folder = 'replate/food') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 900, crop: 'limit' }, // Limit max dimensions
          { quality: 'auto:good' },                     // Auto-optimize quality
          { fetch_format: 'auto' }                      // Serve WebP where supported
        ]
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error.message);
          reject(new Error('Image upload failed'));
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete an image from Cloudinary by public_id
 * @param {string} publicId - The public_id of the image to delete
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
    throw new Error('Image deletion failed');
  }
};

module.exports = { uploadImage, deleteImage };
