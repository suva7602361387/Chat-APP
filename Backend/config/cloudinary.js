const cloudinary = require("cloudinary").v2;
require("dotenv").config();

const cloudinaryConnect = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log("✅ Cloudinary connected");
  } catch (error) {
    console.error("❌ Cloudinary error:", error);
  }
};

const uploadToCloudinary = async (file, folder) => {
  if (!file) {
    throw new Error("No file provided to uploadToCloudinary");
  }

  const options = { folder: folder || "Chat-App" };

  // Fallback if mimetype is missing
  const mimetype = file.mimetype || "";

  if (mimetype.startsWith("video")) {
    options.resource_type = "video";
  } else {
    options.resource_type = "image";
  }

  // Use tempFilePath from express-fileupload
  return await cloudinary.uploader.upload(file.tempFilePath, options);
};

module.exports = { cloudinaryConnect, uploadToCloudinary };
