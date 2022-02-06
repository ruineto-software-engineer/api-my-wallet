import { Router } from "express";
import { signIn, signUp } from "../controllers/authController.js";

const authRouter = Router();
authRouter.post('/sign-up', signIn);
authRouter.post('/sign-in', signUp);

export default authRouter;