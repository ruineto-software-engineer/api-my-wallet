import { Router } from "express";
import { 
  getMovements, 
  getMovement, 
  createMovement, 
  updateMovement, 
  deleteMovement 
} from "../controllers/movementController.js";
import validateMovementSchemaMiddleware from "../middlewares/validateMovementSchemaMiddleware.js";
import validateTokenMiddleware from "../middlewares/validateTokenMiddleware.js";

const movementRouter = Router();

movementRouter.use(validateTokenMiddleware);

movementRouter.get('/balance', getMovements);
movementRouter.get('/update/:idMovement', getMovement);
movementRouter.post('/create', validateMovementSchemaMiddleware, createMovement);
movementRouter.put('/update/:idMovement', validateMovementSchemaMiddleware, updateMovement);
movementRouter.delete('/balance/:idMovement', deleteMovement);

export default movementRouter;