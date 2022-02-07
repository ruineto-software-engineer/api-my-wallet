import { Router } from "express";
import authRouter from "./authRouter.js";
import movementRouter from "./movementRouter.js";

const router = Router();

router.use(authRouter);
router.use(movementRouter);

export default router;