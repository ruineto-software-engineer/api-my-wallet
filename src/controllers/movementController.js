import { ObjectId } from "mongodb";
import joi from 'joi';
import db from "../db.js";

export async function getMovements(req, res) {
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
}

export async function getMovement(req, res) {
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
}

export async function createMovement(req, res) {
  const movement = req.body;
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

    await db.collection("movements").insertOne({ ...movement, userId: session.userId });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

export async function updateMovement(req, res) {
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
}

export async function deleteMovement(req, res) {
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
}