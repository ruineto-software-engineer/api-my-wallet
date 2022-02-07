import db from "../db.js";

export default async function validateTokenMiddleware(req, res, next) {
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
  
    const user = await db.collection("users").findOne({ _id: session.userId });
    if(!user){
      res.sendStatus(401);
      return;
    }
  
    res.locals.user = user;
  
    next();    
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}