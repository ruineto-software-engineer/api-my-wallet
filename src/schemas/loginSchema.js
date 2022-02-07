import joi from "joi";

const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().pattern(/^[a-zA-Z0-9]{5,30}$/).required()
});

export default loginSchema;