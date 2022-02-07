import joi from 'joi';

const registerSchema = joi.object({
  name: joi.string().alphanum().min(3).max(10).required(),
  email: joi.string().email().required(),
  password: joi.string().pattern(/^[a-zA-Z0-9]{5,30}$/).required()
});

export default registerSchema;