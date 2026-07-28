import { v2 as cloudinary } from "cloudinary";

const uploadToCloudinary = (
  fileBuffer: Buffer,
): Promise<{ secure_url: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "avora" },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Upload failed"));
        resolve({ secure_url: result.secure_url });
      },
    );
    stream.end(fileBuffer);
  });
};

export default uploadToCloudinary;
