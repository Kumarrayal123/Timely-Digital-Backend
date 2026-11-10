import Booking from '../models/Booking.js';

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Public
 */
export const createBooking = async (req, res) => {
  try {
    const { name, email, mobile, service, industry, bookingDate, bookingTime, message, source } =
      req.body;

    // Field presence validation
    if (!name || !email || !mobile || !service || !industry || !bookingDate || !bookingTime) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide all required fields: name, email, mobile, service, industry, bookingDate, bookingTime.',
      });
    }

    const ipAddress = (
      req.headers['x-forwarded-for'] ||
      req.socket?.remoteAddress ||
      ''
    )
      .split(',')[0]
      .trim();
    const userAgent = req.headers['user-agent'] || '';

    const newBooking = await Booking.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      service: service.trim(),
      industry: industry.trim(),
      bookingDate: bookingDate.trim(),
      bookingTime: bookingTime.trim(),
      message: message?.trim() || '',
      source: source?.trim() || 'Website Booking Form',
      ipAddress,
      userAgent,
    });

    console.log(
      `📅 New booking: ${newBooking.name} | ${newBooking.service} | ${newBooking.bookingDate} ${newBooking.bookingTime}`
    );

    return res.status(201).json({
      success: true,
      message: 'Booking submitted successfully! We will confirm your appointment shortly.',
      data: newBooking,
    });
  } catch (error) {
    console.error('❌ Error creating booking:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while submitting booking.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get all bookings with optional filtering & pagination
 * @route   GET /api/bookings
 * @access  Protected (Admin)
 */
export const getAllBookings = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { mobile: searchRegex },
        { service: searchRegex },
        { industry: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: bookings,
    });
  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving bookings.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get booking statistics
 * @route   GET /api/bookings/stats
 * @access  Protected (Admin)
 */
export const getBookingStats = async (req, res) => {
  try {
    const total = await Booking.countDocuments();
    const pending = await Booking.countDocuments({ status: 'pending' });
    const confirmed = await Booking.countDocuments({ status: 'confirmed' });
    const cancelled = await Booking.countDocuments({ status: 'cancelled' });
    const completed = await Booking.countDocuments({ status: 'completed' });

    const byService = await Booking.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const byIndustry = await Booking.aggregate([
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        total,
        byStatus: { pending, confirmed, cancelled, completed },
        byService,
        byIndustry,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching booking stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching booking statistics.',
    });
  }
};

/**
 * @desc    Get a single booking by ID
 * @route   GET /api/bookings/:id
 * @access  Protected (Admin)
 */
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error('❌ Error fetching booking by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving booking.',
    });
  }
};

/**
 * @desc    Update booking status / notes
 * @route   PUT /api/bookings/:id
 * @access  Protected (Admin)
 */
export const updateBooking = async (req, res) => {
  try {
    const { status, message } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (status !== undefined) booking.status = status;
    if (message !== undefined) booking.message = message;

    const updated = await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Booking updated successfully.',
      data: updated,
    });
  } catch (error) {
    console.error('❌ Error updating booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating booking.',
    });
  }
};

/**
 * @desc    Delete a booking
 * @route   DELETE /api/bookings/:id
 * @access  Protected (Admin)
 */
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking deleted successfully.',
    });
  } catch (error) {
    console.error('❌ Error deleting booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting booking.',
    });
  }
};
