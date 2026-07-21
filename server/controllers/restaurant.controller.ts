//Get all restaurants with search and filters

import { Request, Response } from "express";
import { Restaurant } from "../models/restaurant.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { Booking } from "../models/booking.js";

// GET /ap/restaurants
export const getRestaurants = async (req: Request, res: Response) => {
  try {
    const { search, priceRange, rating, location, sort } = req.query;

    //
    const queryObj: any = { status: "approved" };

    if (search) {
      queryObj.$or = [
        { name: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    if (priceRange) {
      const prices = Array.isArray(priceRange) ? priceRange : [priceRange];
      queryObj.priceRange = { $in: prices };
    }

    if (rating) {
      queryObj.rating = { $gte: parseFloat(rating as string) };
    }

    if (location) {
      queryObj.location = { $regex: location, $options: "i" };
    }

    // Sorting
    let sortOption: any = { createdAt: -1 };
    if (sort === "rating") {
      sortOption = { rating: -1 };
    } else if (sort === "price_low") {
      sortOption = { priceRange: 1 };
    } else if (sort === "price_high") {
      sortOption = { priceRange: -1 };
    }

    const restaurant = await Restaurant.find(queryObj).sort(sortOption);

    res.json(restaurant);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Get featured and exclusive restaurants
export const getFeaturedRestaurants = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const featured = await Restaurant.find({
      status: "approved",
      $or: [{ featured: true }, { exclusive: true }],
    }).limit(6);

    res.json(featured);
  } catch (error: any) {
    console.error("Get featured restaurants error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single restaurant by slug
export const getRestaurantBySlug = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ slug: req.params.slug });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    //If not approved, verify authorization (owner or admin)
    if (restaurant.status !== "approved") {
      let isAuthorized = false;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        try {
          let token = req.headers.authorization.split(" ")[1];
          let decoded = jwt.verify(token, process.env.JWT_SCERET as string) as {
            id: string;
          };

          const user = await User.findById(decoded.id);

          if (
            user &&
            (user.role === "admin" ||
              (user.role === "owner" &&
                restaurant.owner.toString() === user._id.toString()))
          ) {
            isAuthorized = true;
          }
        } catch (error) {
          //Ignore token verify error
        }
      }

      if (!isAuthorized) {
        return res.status(401).json({ message: "Resturant not authorized" });
      }
    }

    res.json(restaurant);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

//Get dynamic seat availability for slots
export const getAvailability = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { date } = req.query;
    if (!date) {
      res.status(400).json({ message: "Date is required" });
      return;
    }

    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      res.status(404).json({ message: "Restaurant not found" });
      return;
    }

    const bookingDate = new Date(date as string);

    //
    const bookings = await Booking.find({
      restaurant: restaurant._id,
      date: bookingDate,
      status: "confirmed",
    });

    //
    const availability = restaurant.availableSlots.map((slot) => {
      const bookedSeats = bookings
        .filter((b) => b.time === slot)
        .reduce((sum, b) => sum + b.guests, 0);

      const totalSeats = restaurant.totalSeats || 20;
      const availabeSeats = Math.max(0, totalSeats - bookedSeats);

      return {
        time: slot,
        availabeSeats,
        isAvailable: availabeSeats > 0,
      };
    });

    res.json(availability);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};
