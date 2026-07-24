import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "./models/user.js";
import { Restaurant } from "./models/restaurant.js";
import { Booking } from "./models/booking.js";
import { restaurantsData } from "./utils/dummy.js";

const MONGODB_URI = process.env.MONGODB_URI || "";

const seedData = async () => {
  try {
    console.log("Connecting to database for seeding....");

    await mongoose.connect(MONGODB_URI);
    console.log("Database connected. Clearing exisiting collections...");

    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Booking.deleteMany({});

    console.log("Creating default users....");

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash("admin123", salt);
    const userPassword = await bcrypt.hash("user123", salt);
    const ownerPassword = await bcrypt.hash("owner123", salt);

    //admin
    const adminUser = await User.create({
      name: "Enzo Fernandes",
      email: "enzo@example.com",
      password: adminPassword,
      phone: "+0123456789",
      role: "admin",
    });

    // user
    const testUser = await User.create({
      name: "Bruno Fernandes",
      email: "bruno@example.com",
      password: userPassword,
      phone: "+0145556789",
      role: "user",
    });

    //owner
    const ownerUser = await User.create({
      name: "Matues Fernandes",
      email: "matues@example.com",
      password: ownerPassword,
      phone: "+0789456123",
      role: "owner",
    });

    console.log("Creating restaurants....");

    console.log("Inserting restaurants....");
    const updatedRestaurantsData = restaurantsData.map((rest, i) => {
      const { ...restInfo } = rest;
      return {
        ...restInfo,
        owner: ownerUser._id,
        status: "approved",
        totalSeats: 20 + i * 5,
      };
    });

    await Restaurant.insertMany(updatedRestaurantsData);
    console.log("Seeding complete! Disconnecting...");

    await mongoose.disconnect();

    console.log("Disconnected from database...");
  } catch (error: any) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
