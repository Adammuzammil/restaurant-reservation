import { Router } from "express";
import { adminOnly, auth } from "../middleware/auth.js";
import {
  approveRestaurant,
  getAdminStats,
  getAllRestaurants,
} from "../controllers/admin.controller.js";

export const adminRouter = Router();

adminRouter.use(auth);
adminRouter.use(adminOnly);

adminRouter.get("/restaurants", getAllRestaurants);
adminRouter.put("/restaurants/:id/approve", approveRestaurant);
adminRouter.get("/stats", getAdminStats);
