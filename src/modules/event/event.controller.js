const { asyncHandler } = require('../../middlewares/errorHandler');
const {
  CreateEventDTO,
  filterEventDTO,
  UpdateEventDTO,
  EventStatusUpdateDTO,
} = require('./event.dto');
const EventService = require('./event.service');

class EventController {
  constructor() {
    this.eventService = new EventService();
  }

  createEvent = asyncHandler(async (req, res) => {
    const eventData = new CreateEventDTO(req.body);
    const organizerId = req.user.id;
    const data = { ...eventData, organizerId };
    const result = await this.eventService.createEvent(data);
    res.sendCreated(result, 'Event created successfully');
  });

  getAllEvents = asyncHandler(async (req, res) => {
    const filterDTO = new filterEventDTO(req.query);
    const result = await this.eventService.getAllEvents(filterDTO);
    res.sendSuccess(
      result.events,
      'Events retrieved successfully',
      result.pagination,
    );
  });

  getAllEventsWebsite = asyncHandler(async (req, res) => {
    const filterDTO = new filterEventDTO(req.query);
    const result = await this.eventService.getAllEventsWebsite(filterDTO);
    res.sendSuccess(
      result.events,
      'Events retrieved successfully',
      result.pagination,
    );
  });

  getAllEventsOrganizer = asyncHandler(async (req, res) => {
    const filterDTO = new filterEventDTO(req.query);
    const userId = req.user.id;
    const result = await this.eventService.getAllEvents(filterDTO, userId);
    res.sendSuccess(
      result.events,
      'Events retrieved successfully',
      result.pagination,
    );
  });

  getEventById = asyncHandler(async (req, res) => {
    const eventId = req.params.id;
    const result = await this.eventService.getEventById(eventId);
    res.sendSuccess(result, 'Event retrieved successfully');
  });

  getEventByIdWithRevenue = asyncHandler(async (req, res) => {
    const eventId = req.params.id;
    const result = await this.eventService.getEventByIdWithRevenue(eventId);
    res.sendSuccess(result, 'Event retrieved successfully');
  });

  getUserBookedEvents = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const result = await this.eventService.getUserBookedEvents(userId);
    res.sendSuccess(result, 'Event retrieved successfully');
  });

  getEventBySlug = asyncHandler(async (req, res) => {
    const slug = req.params.slug;
    const result = await this.eventService.getEventBySlug(slug);
    res.sendSuccess(result, 'Event retrieved successfully');
  });

  updateEvent = asyncHandler(async (req, res) => {
    const eventId = req.params.id;
    const updateData = new UpdateEventDTO(req.body);
    const result = await this.eventService.updateEvent(eventId, updateData);
    res.sendSuccess(result, 'Event updated successfully');
  });

  updateEventStatus = asyncHandler(async (req, res) => {
    const eventId = req.params.id;
    const { status } = new EventStatusUpdateDTO(req.body);
    const result = await this.eventService.updateEventStatus(eventId, status);
    res.sendSuccess(result, 'Event status updated successfully');
  });

  deleteEvent = asyncHandler(async (req, res) => {
    const eventId = req.params.id;
    const result = await this.eventService.deleteEvent(eventId);
    res.sendSuccess(null, 'event delete successfully');
  });
}

module.exports = EventController;
