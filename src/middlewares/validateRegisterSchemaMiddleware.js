import registerSchema from "../schemas/registerSchema.js";

export default function validateRegisterSchemaMiddleware(req, res, next) {
  const validation = registerSchema.validate(req.body, { abortEarly: false });
  if(validation.error){
    res.status(422).send(validation.error.details.map(error => error.message).join('/'));
    return;
  }

  next();
}