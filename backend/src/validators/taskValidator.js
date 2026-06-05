const Joi = require('joi');

// ─── Task Schema ─────────────────────────────────────────────────────────────
// Validates the request body when creating or updating a task
const taskSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.min': 'Title cannot be empty',
      'string.max': 'Title must be at most 200 characters',
      'any.required': 'Title is required',
    }),

  description: Joi.string()
    .allow('')
    .optional()
    .messages({
      'string.base': 'Description must be a string',
    }),

  status: Joi.string()
    .valid('pending', 'in-progress', 'done')
    .default('pending')
    .messages({
      'any.only': 'Status must be one of: pending, in-progress, done',
    }),

  due_date: Joi.date()
    .iso()
    .allow(null)
    .optional()
    .messages({
      'date.format': 'Due date must be a valid ISO date (e.g. 2026-06-15)',
    }),

  team_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Team ID must be a number',
      'number.positive': 'Team ID must be a positive number',
      'any.required': 'Team ID is required',
    }),

  assigned_to: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .optional()
    .messages({
      'number.base': 'Assigned user ID must be a number',
      'number.positive': 'Assigned user ID must be a positive number',
    }),
});

module.exports = { taskSchema };
