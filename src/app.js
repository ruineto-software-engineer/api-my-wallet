import express, { json } from "express";
import cors from 'cors';
import router from "./routes/index.js";

const app = express();
app.use(cors());
app.use(json());

app.use(router);

/* Listen - Running app in http://localhost:5000 */
app.listen(5000, () => {
  console.log('Running app in http://localhost:5000');
});