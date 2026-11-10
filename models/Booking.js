import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      maxlength: [25, 'Mobile number cannot exceed 25 characters'],
    },
    service: {
      type: String,
      required: [true, 'Service is required'],
      trim: true,
      enum: [
        'SEO',
        'Social Media Marketing',
        'Google Ads',
        'Meta Ads',
        'Lead Generation',
        'Content Marketing',
        'Website Design & Development',
        'Full Digital Marketing Package',
        'Other',
      ],
    },
    industry: {
      type: String,
      required: [true, 'Industry / Business Type is required'],
      trim: true,
      enum: [
        'Hospital',
        'Clinic',
        'Diagnostic Labs',
        'Doctors & Specialists',
        'Healthcare Startups',
        'Home Healthcare',
        'Other',
      ],
    },
    bookingDate: {
      type: String,
      required: [true, 'Booking date is required'],
      trim: true,
    },
    bookingTime: {
      type: String,
      required: [true, 'Booking time is required'],
      trim: true,
    },
    message: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    source: {
      type: String,
      default: 'Website Booking Form',
      trim: true,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for performance
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ email: 1 });
bookingSchema.index({ mobile: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingDate: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
