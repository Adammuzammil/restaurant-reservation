import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
  cancelBooking,
  createBooking,
  getBookings,
} from "../controllers/booking.controller.js";

export const bookingRouter = Router();

bookingRouter.post("/", auth, createBooking);
bookingRouter.get("/my", auth, getBookings);
bookingRouter.put("/:id/cancel", auth, cancelBooking);
