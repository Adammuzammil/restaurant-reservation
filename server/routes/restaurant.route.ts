import { Router } from "express";
import {
  getAvailability,
  getFeaturedRestaurants,
  getRestaurantBySlug,
  getRestaurants,
} from "../controllers/restaurant.controller.js";

export const restaurantRouter = Router();

restaurantRouter.get("/", getRestaurants);
restaurantRouter.get("/featured", getFeaturedRestaurants);
restaurantRouter.get("/:slug", getRestaurantBySlug);
restaurantRouter.get("/:id/availability", getAvailability);
