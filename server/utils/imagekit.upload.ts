import imagekit from "../config/imagekit.js";

const uploadToImageKit = (
  fileBuffer: Buffer,
  fileName: string,
): Promise<{ secure_url: string }> => {
  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file: fileBuffer, // can be buffer, base64, or URL
        fileName: fileName,
        folder: "/avora",
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Upload failed"));
        resolve({ secure_url: result.url });
      },
    );
  });
};

export default uploadToImageKit;
