import { Router } from "express";
import {
  createOwnerRestaurant,
  getOwnerRestaurant,
  getOwnersBooking,
  updateBookingStatus,
  updateOwnerRestaurant,
} from "../controllers/owner.controller.js";
import upload from "../config/multer.js";
import { auth, ownerOnly } from "../middleware/auth.js";

export const ownerRouter = Router();

ownerRouter.use(auth);
ownerRouter.use(ownerOnly);

ownerRouter.get("/restaurant", getOwnerRestaurant);
ownerRouter.post("/restaurant", upload.single("image"), createOwnerRestaurant);
ownerRouter.put("/restaurant", upload.single("image"), updateOwnerRestaurant);
ownerRouter.get("/bookings", getOwnersBooking);
ownerRouter.put("/bookings/:id/status", updateBookingStatus);
