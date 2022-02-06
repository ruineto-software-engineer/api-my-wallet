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
    name: joi.string().alphanum().min(3).max(10).required(),
    email: joi.string().email().required(),
    password: joi.string().pattern(/^[a-zA-Z0-9]{5,30}$/).required()
  });
  const validation = userSchema.validate(user);
  if(validation.error){
    res.status(422).send(validation.error.details.map(error => error.message));
    return;
  }

  try {
    const users = await db.collection("users").find({}).toArray();

    const usersNames = users.map(user => user.name);
    const usersEmails = users.map(user => user.email);

    const searchUserNames = usersNames.find(userName => userName === user.name);
    const searchUserEmails = usersEmails.find(userEmail => userEmail === user.email);

    if(searchUserNames === undefined && searchUserEmails === undefined){
      const passwordHashed = bcrypt.hashSync(user.password, 10);
      const userHashed = { ...user, password: passwordHashed };
  
      await db.collection("users").insertOne(userHashed);
  
      res.sendStatus(201); 
    }else{
      res.sendStatus(409);
      return;
    }
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
    password: joi.string().pattern(/^[a-zA-Z0-9]{5,30}$/).required()
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

      res.send({ token, name: user.name });
      return;
    }

    res.sendStatus(401);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});



/* Balance Routes */
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
  
    const movements = await db.collection("movements").find({ userId: session.userId }).toArray();
    res.send(movements);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.delete('/balance/:idMovement', async (req, res) => {
  const idMovement = req.params.idMovement;
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

    const searchedMoviment = await db.collection("movements").findOne({ _id: new ObjectId(idMovement) });
    if(!searchedMoviment){
      res.sendStatus(404);
      return;
    }

    const searchedUser = await db.collection("users").findOne({ _id: searchedMoviment.userId });
    if(!searchedUser){
      res.sendStatus(401);
      return;
    }

    await db.collection("movements").deleteOne({ _id: searchedMoviment._id });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});



/* Input Route */
app.post('/input', async (req, res) => {
  const input = req.body;
  const authorization = req.headers.authorization;
  const token = authorization?.replace('Bearer ', '');
  if(!token){
    res.sendStatus(401);
    return;
  }

  const inputSchema = joi.object({
    value: joi.string().max(10).required(),
    description: joi.string().min(5).max(20).required(),
    date: joi.string().max(5).required(),
    isInput: joi.boolean().required()
  });
  const validation = inputSchema.validate(input);
  if(validation.error){
    res.status(422).send(validation.error.details.map(error => error.message));
    return;
  }

  try {
    const session = await db.collection("sessions").findOne({ token });
    if(!session){
      res.sendStatus(401);
      return;
    }

    await db.collection("movements").insertOne({ ...input, userId: session.userId });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});



/* Output Route */
app.post('/output', async (req, res) => {
  const output = req.body;
  const authorization = req.headers.authorization;
  const token = authorization?.replace('Bearer ', '');
  if(!token){
    res.sendStatus(401);
    return;
  }

  const outputSchema = joi.object({
    value: joi.string().max(10).required(),
    description: joi.string().min(5).max(20).required(),
    date: joi.string().max(5).required(),
    isInput: joi.boolean().required()
  });
  const validation = outputSchema.validate(output);
  if(validation.error){
    res.status(422).send(validation.error.details.map(error => error.message));
    return;
  }

  try {
    const session = await db.collection("sessions").findOne({ token });
    if(!session){
      res.sendStatus(401);
      return;
    }

    await db.collection("movements").insertOne({ ...output, userId: session.userId });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});



/* Update Routes */
app.get('/update/:idMovement', async (req, res) => {
  const idMovement = req.params.idMovement;
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

    const searchedMoviment = await db.collection("movements").findOne({ _id: new ObjectId(idMovement) });
    if(!searchedMoviment){
      res.sendStatus(404);
      return;
    }

    res.send(searchedMoviment);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.put('/update/:idMovement', async (req, res) => {
  const movement = req.body;
  const idMovement = req.params.idMovement;
  const authorization = req.headers.authorization;
  const token = authorization?.replace('Bearer ', '');
  if(!token){
    res.sendStatus(401);
    return;
  }
  
  const movementSchema = joi.object({
    value: joi.string().max(10).required(),
    description: joi.string().min(5).max(20).required(),
    date: joi.string().max(5).required(),
    isInput: joi.boolean().required()
  });
  const validation = movementSchema.validate(movement);
  if(validation.error){
    res.status(422).send(validation.error.details.map(error => error.message));
    return;
  }

  try {
    const session = await db.collection("sessions").findOne({ token });
    if(!session){
      res.sendStatus(401);
      return;
    }

    const searchedMoviment = await db.collection("movements").findOne({ _id: new ObjectId(idMovement) });
    if(!searchedMoviment){
      res.sendStatus(404);
      return;
    }

    const searchedUser = await db.collection("users").findOne({ _id: searchedMoviment.userId });
    if(!searchedUser){
      res.sendStatus(401);
      return;
    }

    const updatedMovement = { ...movement, userId: searchedUser._id }

    await db.collection("movements").updateOne(
      { _id: searchedMoviment._id },
      { $set: updatedMovement }
    );
    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);    
  }
});



/* Listen - Running app in http://localhost:5000 */
app.listen(5000, () => {
  console.log('Running app in http://localhost:5000');
});