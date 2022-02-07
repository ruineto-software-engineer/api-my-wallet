import { ObjectId } from "mongodb";
import db from "../db.js";

export async function getMovements(req, res) {
  const user = res.locals.user;

  try {  
    const movements = await db.collection("movements").find({ userId: user._id }).toArray();
    res.send(movements);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

export async function getMovement(req, res) {
  const idMovement = req.params.idMovement;

  try {
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
  const user = res.locals.user;
  const movement = req.body;

  try {
    await db.collection("movements").insertOne({ ...movement, userId: user._id });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

export async function updateMovement(req, res) {
  const movement = req.body;
  const idMovement = req.params.idMovement;

  try {
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

  try {
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