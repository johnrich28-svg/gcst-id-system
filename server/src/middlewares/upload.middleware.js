import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gcst-id-system',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
  },
});

export const upload = multer({ storage });
