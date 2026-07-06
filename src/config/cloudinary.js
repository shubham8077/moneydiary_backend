import { v2 as cloudinary } from "cloudinary";

const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

let cloudinaryInitialized = false;
const initializeCloudinary = () => {
  if (cloudinaryInitialized) return;

  if (isCloudinaryConfigured()) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  } else {
    console.log(
      "Cloudinary not configured. File uploads will fall back to local/base64 simulation.",
    );
  }

  cloudinaryInitialized = true;
};

export const uploadToCloudinary = async (fileBuffer, originalName) => {
  initializeCloudinary();

  if (!isCloudinaryConfigured()) {
    const base64Data = fileBuffer.toString("base64");
    const mimeType = originalName.endsWith(".png") ? "image/png" : "image/jpeg";
    return `data:${mimeType};base64,${base64Data}`;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "money-diary-receipts" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      },
    );
    uploadStream.end(fileBuffer);
  });
};
