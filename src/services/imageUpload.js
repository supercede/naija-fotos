import cloudinary from 'cloudinary';
import cloudinaryStorage from 'multer-storage-cloudinary';
import { config } from 'dotenv';
import multer from 'multer';

config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const avatarStorage = cloudinaryStorage({
  cloudinary,
  folder: 'naijafotos-avatars',
  allowedFormats: ['jpg', 'png', 'jpeg'],
  transformation: [{ width: 200, height: 200, crop: 'scale' }],
});

const photoStorage = cloudinaryStorage({
  cloudinary,
  folder: 'naijafotos-imgs',
  allowedFormats: ['jpg', 'png', 'jpeg'],
});

export const AvatarUploads = multer({ storage: avatarStorage });

export const PhotoUploads = multer({ storage: photoStorage });
