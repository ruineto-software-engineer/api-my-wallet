import express, { json } from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from 'cors';
import joi from 'joi';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
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



/* Sign-up Route */
app.post('/sign-up', async (req, res) => {
  const user = req.body;

  const userSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required()
  });
  const validation = userSchema.validate(user);
  if(validation.error){
    res.status(422).send(validation.error.details.map(error => error.message));
    return;
  }

  try {
    const passwordHashed = bcrypt.hashSync(user.password, 10);
    const userHashed = { ...user, password: passwordHashed };

    await db.collection("users").insertOne(userHashed);

    res.sendStatus(201);    
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});



/* Sign-in Route */
app.post('/sign-in', async (req, res) => {
  const { email, password } = req.body;

  const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
  });
  const validation = loginSchema.validate({ email, password });
  if(validation.error){
    res.status(422).send(validation.error.details.map(error => error.message));
    return;
  }

  try {
    const user = await db.collection("users").findOne({ email });
    if(!user){
      res.sendStatus(401);
      return;
    }

    const isAuthorized = bcrypt.compareSync(password, user.password);
    if(isAuthorized){
      const token = uuid();

      await db.collection("sessions").insertOne({ token, userId: user._id });

      res.send(token);
      return;
    }

    res.sendStatus(401);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});



/* Balance Route */
app.get('/balance', async (req, res) => {
  const authorization = req.headers.authorization;
  const token = authorization?.replace('Bearer ', '');
  if(!token){
    res.sendStatus(401);
    return;
  }

  try {
    const session = await db.collection("sessions").findOne({ token });
    if(!session){
      res.sendStatus(401);
      return;
    }
  
    const movements = await db.collection("movements").find({ userId: session._id }).toArray();
    res.send(movements);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});



/* Listen - Running app in http://localhost:5000 */
app.listen(5000, () => {
  console.log('Running app in http://localhost:5000');
});