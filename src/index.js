import express, { json } from "express";
import cors from 'cors';
import { signIn, signUp } from "./controllers/authController.js";
import { getMovements, getMovement, createMovement, updateMovement, deleteMovement } from "./controllers/movementController.js";

const app = express();
app.use(cors());
app.use(json());

/* Auth Controller */
app.post('/sign-up', signIn);
app.post('/sign-in', signUp);

/* Movement Controller */
app.get('/balance', getMovements);
app.get('/update/:idMovement', getMovement);
app.post('/create', createMovement);
app.put('/update/:idMovement', updateMovement);
app.delete('/balance/:idMovement', deleteMovement);

/* Listen - Running app in http://localhost:5000 */
app.listen(5000, () => {
  console.log('Running app in http://localhost:5000');
});