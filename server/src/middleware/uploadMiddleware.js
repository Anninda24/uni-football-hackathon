import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'mock_cloud',
  api_key: process.env.CLOUDINARY_API_KEY || 'mock_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mock_secret'
});

// Configure Multer memory storage (rejects local disk upload entirely)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Middleware to parse single file field 'image'
export const uploadImage = upload.single('image');

// Helper function to stream buffer to Cloudinary
export const streamUploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    // Fallback Mocking if Cloudinary credentials are not provided (for easier local testing/eval)
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME === 'mock_cloud'
    ) {
      console.log('☁️ Cloudinary not fully configured in env. Using mock upload fallback.');
      return resolve({
        secure_url: `https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&q=80&mock=${Date.now()}`,
        public_id: `mock_public_id_${Date.now()}`
      });
    }

    const cld_upload_stream = cloudinary.uploader.upload_stream(
      {
        folder: 'uni_football_profiles'
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(cld_upload_stream);
  });
};
