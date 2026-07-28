import dotenv from "dotenv";
dotenv.config();

console.log("Public key loaded:", process.env.IMAGEKIT_PUBLIC_KEY);

const { default: imagekit } = await import("./imagekit.js");
const fs = await import("fs");

const buffer = fs.readFileSync("./test-image.jpg");

imagekit
  .upload({
    file: buffer,
    fileName: "test-image.jpg",
    folder: "/avora",
  })
  .then((result) => console.log("SUCCESS:", result.url))
  .catch((err) => console.error("FAILED:", err));
