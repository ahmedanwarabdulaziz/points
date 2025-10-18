import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dbo3xd0df',
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '984549417134457',
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET || 'zfKeoO4s5EUBljSHZYUmtBcUeSM',
  secure: true
});

export default cloudinary;
