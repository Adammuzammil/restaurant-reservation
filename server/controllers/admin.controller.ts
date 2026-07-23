import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { Restaurant } from "../models/restaurant.js";
import { User } from "../models/user.js";
import { Booking } from "../models/booking.js";

// Get all restaurants for admin management
// GET /api/admin/restaurants
export const getAllRestaurants = async (req: AuthRequest, res: Response) => {
  try {
    const restaurants = await Restaurant.find({})
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Approve/reject a restaurant profile
// PUT /api/admin/restaurants/:id/approve
export const approveRestaurant = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!status || !["approved", "rejected", "pending"].includes(status)) {
      res.status(400).json({ message: "Please enter a valid booking status" });
      return;
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      res.status(404).json({ message: "Restaurant not found" });
      return;
    }

    restaurant.status = status;
    await restaurant.save();
    res.json(restaurant);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get system statistics
// GET /api/admin/stats
export const getAdminStats = async (reqq: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalOwners = await User.countDocuments({ role: "owner" });
    const totalRestaurants = await Restaurant.countDocuments({});
    const totalBookings = await Booking.countDocuments({});

    // Get latest 10 bookings
    const latestBookings = await Booking.find({})
      .populate("user", "name email")
      .populate("restaurant", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      users: {
        totalUsers,
        totalOwners,
        total: totalUsers + totalOwners,
      },
      restaurants: {
        total: totalRestaurants,
      },
      bookings: {
        total: totalBookings,
      },
      latestBookings,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
