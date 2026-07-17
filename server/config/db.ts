import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("Mongoose Connected"),
    );
    await mongoose.connect(process.env.MONGODB_URI!);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
