import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { Restaurant } from "../models/restaurant.js";
import { Booking } from "../models/booking.js";

// Create a new booking
// POST /api/bookings
// @access Private
export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { restaurantId, date, time, guests, occasion, specialRequests } =
      req.body;

    if (!restaurantId || !date || !time || !guests) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      res.status(404).json({ message: "Restaurant not found" });
      return;
    }

    //
    const requestGuests = Number(guests);

    const existingBookings = await Booking.find({
      restaurant: restaurantId,
      date: new Date(date),
      time,
      status: "confirmed",
    });

    const bookedSeats = existingBookings.reduce((sum, b) => sum + b.guests, 0);

    const totalSeats = restaurant.totalSeats || 20;
    const availableSeats = totalSeats - bookedSeats;

    if (availableSeats < requestGuests) {
      res.status(400).json({ message: `Unable to reserve. Only` });
      return;
    }

    const booking = await Booking.create({
      user: req.user?._id,
      restaurant: restaurantId,
      date: new Date(date),
      time,
      guests: Number(guests),
      occasion,
      specialRequests,
      status: "confirmed",
    });

    //Populate restaurant info before returning
    const populateBooking = await Booking.populate(
      "restaurant",
      "name location image address",
    );

    res.status(201).json(populateBooking);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get all bookings for a user
// GET /api/bookings/my
// @access Private
export const getBookings = async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await Booking.find({ user: req.user?._id })
      .populate("restaurant", "name location image address slug")
      .sort({ date: -1, time: -1 });
    res.json(bookings);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Cancel a booking
// DELETE /api/bookings/:id/cancel
// @access Private
export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    //Verify user is the owner of the booking
    if (booking.user.toString() !== req.user?._id.toString()) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    booking.status = "cancelled";

    await booking.save();

    const populatedBooking = await Booking.populate(
      "restaurant",
      "name location image address",
    );

    res.json(populatedBooking);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
