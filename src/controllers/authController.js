import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import db from "../db.js";

export async function signIn(req, res) {
  const user = req.body;

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