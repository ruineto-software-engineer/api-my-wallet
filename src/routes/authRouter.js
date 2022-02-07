import { Router } from "express";
import { signIn, signUp } from "../controllers/authController.js";
import validateRegisterSchemaMiddleware from "../middlewares/validateRegisterSchemaMiddleware.js";
import validateLoginSchemaMiddleware from "../middlewares/validateLoginSchemaMiddleware.js";

const authRouter = Router();

authRouter.post('/sign-up', validateRegisterSchemaMiddleware, signIn);
authRouter.post('/sign-in', validateLoginSchemaMiddleware, signUp);

export default authRouter;