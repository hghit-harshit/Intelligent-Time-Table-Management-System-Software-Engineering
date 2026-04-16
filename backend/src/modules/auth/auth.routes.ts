import { Router } from "express";
import * as authController from "./auth.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.get("/profile", authMiddleware, authController.getProfile);
router.put("/profile", authMiddleware, authController.updateProfile);

export default router;