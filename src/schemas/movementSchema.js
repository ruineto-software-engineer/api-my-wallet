import joi from 'joi';

const movementSchema = joi.object({
  value: joi.string().max(10).required(),
  description: joi.string().min(5).max(20).required(),
  date: joi.string().max(5).required(),
  isInput: joi.boolean().required()
});

export default movementSchema;