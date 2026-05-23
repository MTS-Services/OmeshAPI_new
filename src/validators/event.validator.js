/**
 * Event validation schemas
 * Joi schemas for validating Event-related requests
 */
const Joi = require('joi');

const CreateEventSchema = Joi.object({
  // Basic Info
  title: Joi.string().required().trim().min(3).max(255),
  coverImageUrl: Joi.string().uri().allow(null, ''),
  flag: Joi.boolean().default(false),
  status: Joi.string()
    .valid('PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED', 'DRAFT')
    .default('PENDING'),

  // Schedule & Location
  startAt: Joi.date().iso().required(),
  endAt: Joi.date().iso().min(Joi.ref('startAt')).allow(null),
  timezone: Joi.string().default('UTC'),
  time: Joi.string().optional(),
  location: Joi.string().required(),
  country: Joi.string().required(),
  distance: Joi.string().allow(null, ''),

  // Pricing & Capacity
  price: Joi.number().precision(2).min(0).default(0),
  currency: Joi.string().length(3).uppercase().default('USD'),
  totalSeats: Joi.number().integer().min(0).default(0),
  availableSeats: Joi.number().integer().min(0).max(Joi.ref('totalSeats')),

  // Rich Description
  headline: Joi.string().allow(null, ''),
  body: Joi.string().allow(null, ''),
  tagline: Joi.string().allow(null, ''),
  bulletsTop: Joi.array().items(Joi.string()).default([]),
  bulletsBottom: Joi.array().items(Joi.string()).default([]),
  images: Joi.array().items(Joi.string()).default([]),
  tShirtIncluded: Joi.boolean().default(false),
  tShirtSizes: Joi.array().items(Joi.string()).default([]),
  tShirtPrice: Joi.number().precision(2).min(0).default(0),
  isFree: Joi.boolean().default(false),
  tShirtImageUrl: Joi.array().items(Joi.string()).default([]),
  promoCode: Joi.string().allow(null, ''),

  // Relations
  //   organizerId: Joi.string().required(),
});

const UpdateEventSchema = Joi.object({
  title: Joi.string().trim().min(3).max(255).optional(),
  slug: Joi.string().trim().lowercase().optional(),
  coverImageUrl: Joi.string().uri().allow(null, '').optional(),
  flag: Joi.boolean().optional(),
  status: Joi.string()
    .valid(
      'DRAFT',
      'PENDING',
      'APPROVED',
      'UPCOMING',
      'ONGOING',
      'COMPLETED',
      'REJECTED',
      'SUSPENDED',
      'CANCELLED',
    )
    .optional(),

  startAt: Joi.date().iso().optional(),
  endAt: Joi.date().iso().min(Joi.ref('startAt')).allow(null).optional(),
  location: Joi.string().optional(),
  country: Joi.string().optional(),
  distance: Joi.string().allow(null, ''),
  registerClose: Joi.boolean().optional(),
  complete: Joi.boolean().optional(),

  price: Joi.number().precision(2).min(0).optional(),
  totalSeats: Joi.number().integer().min(0).optional(),

  headline: Joi.string().allow(null, '').optional(),
  body: Joi.string().allow(null, '').optional(),
  tagline: Joi.string().allow(null, '').optional(),
  bulletsTop: Joi.array().items(Joi.string()).optional(),
  bulletsBottom: Joi.array().items(Joi.string()).optional(),
  images: Joi.array().items(Joi.string()).optional(),
  tShirtIncluded: Joi.boolean().optional(),
  tShirtSizes: Joi.array().items(Joi.string()).optional(),
  tShirtPrice: Joi.number().precision(2).min(0).optional(),
  isFree: Joi.boolean().optional(),
  tShirtImageUrl: Joi.array().items(Joi.string()).optional(),
  promoCode: Joi.string().allow(null, '').optional(),
}).min(1); // Require at least one field to perform an update

const statusUpdateSchema = Joi.object({
  status: Joi.string()
    .valid(
      'DRAFT',
      'PENDING',
      'APPROVED',
      'UPCOMING',
      'ONGOING',
      'COMPLETED',
      'REJECTED',
      'SUSPENDED',
      'CANCELLED',
    )
    .required(),
});

module.exports = {
  CreateEventSchema,
  UpdateEventSchema,
  statusUpdateSchema,
};
