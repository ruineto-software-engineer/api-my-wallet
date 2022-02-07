import movementSchema from "../schemas/movementSchema.js";

export default function validateMovementSchemaMiddleware(req, res, next) {
  const validation = movementSchema.validate(req.body, { abortEarly: false });
  if(validation.error){
    res.status(422).send(validation.error.details.map(error => error.message).join('/'));
    return;
  }

  next();
}