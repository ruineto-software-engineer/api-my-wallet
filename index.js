import express, { json } from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from 'cors';
import joi from 'joi';
import dotenv from "dotenv";
dotenv.config();



/* MongoDB - Data Base Connection */
const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect(() => {
  db = mongoClient.db("api_my_wallet");
});

const app = express();
app.use(cors());
app.use(json());



/* Listen - Running app in http://localhost:5000 */
app.listen(5000, () => {
  console.log('Running app in http://localhost:5000');
});