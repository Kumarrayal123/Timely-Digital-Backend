import mongoose from 'mongoose';

const consultationLeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [150, 'Business name cannot exceed 150 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [25, 'Phone number cannot exceed 25 characters'],
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
    businessType: {
      type: String,
      required: [true, 'Business type is required'],
      trim: true,
    },
    lookingFor: {
      type: String,
      required: [true, 'Selected service is required'],
      trim: true,
    },
    source: {
      type: String,
      default: 'Website Consultation Form',
      trim: true,
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'in_progress', 'converted', 'closed'],
      default: 'new',
    },
    notes: {
      type: String,
      default: '',
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

// Indexing for search and query performance
consultationLeadSchema.index({ createdAt: -1 });
consultationLeadSchema.index({ email: 1 });
consultationLeadSchema.index({ phone: 1 });
consultationLeadSchema.index({ status: 1 });

const ConsultationLead = mongoose.model('ConsultationLead', consultationLeadSchema);

export default ConsultationLead;
