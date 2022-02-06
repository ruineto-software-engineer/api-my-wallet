import joi from 'joi';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import db from "../db.js";

export async function signIn(req, res) {
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
}

export async function signUp(req, res) {
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
}