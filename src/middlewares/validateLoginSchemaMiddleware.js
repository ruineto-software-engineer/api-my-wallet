import loginSchema from "../schemas/loginSchema.js";

export default function validateLoginSchemaMiddleware(req, res, next) {
  const validation = loginSchema.validate(req.body, { abortEarly: false });
  if(validation.error){
    res.status(422).send(validation.error.details.map(error => error.message).join('/'));
    return;
  }

  next();
}