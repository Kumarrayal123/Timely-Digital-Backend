import express from 'express';
import {
  createBooking,
  getAllBookings,
  getBookingStats,
  getBookingById,
  updateBooking,
  deleteBooking,
} from '../controllers/bookingController.js';

const router = express.Router();

// Booking statistics summary
router.get('/stats', getBookingStats);

// Booking collection routes
router.route('/').post(createBooking).get(getAllBookings);

// Individual booking routes
router.route('/:id').get(getBookingById).put(updateBooking).delete(deleteBooking);

export default router;
