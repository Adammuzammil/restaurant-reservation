import { Router } from "express";
import { getProfile, login, register } from "../controllers/auth.controller.js";
import { auth } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/profile", auth, getProfile);
