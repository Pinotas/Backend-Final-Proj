const Joi = require("joi");

const createPollSchema = Joi.object({
  question: Joi.string().required(),
  options: Joi.array().items(Joi.string()).min(2).max(10).required(),
});

const voteSchema = Joi.object({
  option: Joi.string().required(),
});

module.exports = {
  createPollSchema,
  voteSchema,
};
