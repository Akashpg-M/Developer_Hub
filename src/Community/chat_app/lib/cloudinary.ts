import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";

config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

// Type augmentation for cloudinary
declare module 'cloudinary' {
  interface CloudinaryUploadResponse {
    secure_url: string;
  }
}

export default cloudinary; 