const { asyncHandler } = require('../../middlewares/errorHandler');
const RegistrationService = require('./eventRegistration.services');
const {
  RegistrationDTO,
  FilterRegistrationDTO,
} = require('./eventRegistration.dto');
const XLSX = require('xlsx');

class RegistrationController {
  constructor() {
    this.services = new RegistrationService();
  }

  eventRegistration = asyncHandler(async (req, res) => {
    const user = req.user;
    const dto = new RegistrationDTO(req.body);

    console.log('Received registration request:', user);

    const result = await this.services.processRegistration(dto, user);
    res.sendCreated(result, 'Payout requested successfully');
  });

  fygaroEventRegistration = asyncHandler(async (req, res) => {
    const user = req.user;
    const dto = new RegistrationDTO(req.body);
    const result = await this.services.processFygaroRegistration(dto, user);
    res.sendCreated(result, 'Fygaro payment created successfully');
  });

  getEventRegistration = asyncHandler(async (req, res) => {
    const filterDTO = new FilterRegistrationDTO(req.query);
    const result = await this.services.getAllRegistration(filterDTO);
    res.sendSuccess(
      result.data,
      'Events Registration retrieved successfully',
      result.pagination,
    );
  });

  getEventPayment = asyncHandler(async (req, res) => {
    const result = await this.services.getAllPayment();
    res.sendSuccess(result, 'Events Registration retrieved successfully');
  });

  downloadRegistrationCsv = asyncHandler(async (req, res) => {
    const filterDTO = new FilterRegistrationDTO(req.query);
    const rows = await this.services.getRegistrationExportData(filterDTO);

    const headers = [
      // 'registrationId',
      // 'eventId',
      'eventTitle',
      'firstName',
      'lastName',
      'email',
      'phone',
      'age',
      'gender',
      'status',
      'source',
      'couponCode',
      'selectedTShirtSize',
      'teamClub',
      'residential_area',
      'createdAt',
    ];

    const escapeCsv = (value) => {
      if (value === null || value === undefined) return '';
      const text = String(value);
      if (/[",\n]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };

    const csv = [
      headers.join(','),
      ...rows.map((row) => headers.map((key) => escapeCsv(row[key])).join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="event-registrations-${Date.now()}.csv"`,
    );
    res.send(`\ufeff${csv}`);
  });

  downloadRegistrationExcel = asyncHandler(async (req, res) => {
    const filterDTO = new FilterRegistrationDTO(req.query);
    const rows = await this.services.getRegistrationExportData(filterDTO);

    const worksheet = XLSX.utils.json_to_sheet(rows, {
      header: [
        'eventTitle',
        'firstName',
        'lastName',
        'email',
        'phone',
        'status',
        'age',
        'gender',
        'source',
        'couponCode',
        'selectedTShirtSize',
        'teamClub',
        'residential_area',
        'createdAt',
      ],
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer',
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="event-registrations-${Date.now()}.xlsx"`,
    );

    res.end(excelBuffer);
  });
}

module.exports = RegistrationController;
