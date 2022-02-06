import { Router } from "express";
import { 
  getMovements, 
  getMovement, 
  createMovement, 
  updateMovement, 
  deleteMovement 
} from "../controllers/movementController.js";

const movementRouter = Router();
movementRouter.get('/balance', getMovements);
movementRouter.get('/update/:idMovement', getMovement);
movementRouter.post('/create', createMovement);
movementRouter.put('/update/:idMovement', updateMovement);
movementRouter.delete('/balance/:idMovement', deleteMovement);

export default movementRouter;