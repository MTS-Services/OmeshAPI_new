/**
 * Event Management Routes
 * Defines all event management endpoints with appropriate middleware
 */
const express = require('express');

const EventController = require('./event.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { validate } = require('../../validators/common.validator');
const {
  CreateEventSchema,
  UpdateEventSchema,
  statusUpdateSchema,
} = require('../../validators/event.validator');
const { EventStatusUpdateDTO } = require('./event.dto');
const upload = require('../../middlewares/upload');

const eventController = new EventController();

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorize(['ADMIN', 'ORGANIZER']),
  validate(CreateEventSchema),
  eventController.createEvent,
);
router.get('/', eventController.getAllEvents);
router.get('/website', eventController.getAllEventsWebsite);
router.get(
  '/organizer',
  authenticate,
  authorize(['ORGANIZER']),
  eventController.getAllEventsOrganizer,
);
router.get(
  '/user/booked',
  authenticate,
  authorize(['USER']),
  eventController.getUserBookedEvents,
);
router.get('/:id', eventController.getEventById);
router.get(
  '/revenue/:id',
  authenticate,
  authorize(['ORGANIZER']),
  eventController.getEventByIdWithRevenue,
);
router.get('/slug/:slug', eventController.getEventBySlug);
router.patch(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'ORGANIZER']),
  validate(UpdateEventSchema),
  eventController.updateEvent,
);

router.patch(
  '/close/:id',
  authenticate,
  authorize(['ADMIN', 'ORGANIZER']),
  validate(UpdateEventSchema),
  eventController.updateEvent,
);

router.patch(
  '/status/:id',
  authenticate,
  authorize(['ADMIN']),
  validate(statusUpdateSchema),
  eventController.updateEventStatus,
);

router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'ORGANIZER']),
  eventController.deleteEvent,
);

module.exports = router;
