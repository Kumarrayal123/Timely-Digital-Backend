import ConsultationLead from '../models/ConsultationLead.js';

/**
 * @desc    Submit a new consultation lead
 * @route   POST /api/consultation-leads
 * @access  Public
 */
export const createLead = async (req, res) => {
  try {
    const { name, businessName, phone, email, businessType, lookingFor, source, notes } = req.body;

    // Field presence validation
    if (!name || !businessName || !phone || !email || !businessType || !lookingFor) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, businessName, phone, email, businessType, lookingFor.',
      });
    }

    const ipAddress = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
    const userAgent = req.headers['user-agent'] || '';

    const newLead = await ConsultationLead.create({
      name: name.trim(),
      businessName: businessName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      businessType: businessType.trim(),
      lookingFor: lookingFor.trim(),
      source: source?.trim() || 'Website Consultation Form',
      notes: notes?.trim() || '',
      ipAddress,
      userAgent,
    });

    console.log(`📥 New lead received: ${newLead.name} (${newLead.businessName}) - ${newLead.phone}`);

    return res.status(201).json({
      success: true,
      message: 'Consultation request submitted successfully!',
      data: newLead,
    });
  } catch (error) {
    console.error('❌ Error creating consultation lead:', error);

    // Mongoose validation error handling
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while submitting consultation request.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get all consultation leads with optional filtering & pagination
 * @route   GET /api/consultation-leads
 * @access  Public / Protected
 */
export const getAllLeads = async (req, res) => {
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
        { businessName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const total = await ConsultationLead.countDocuments(query);
    const leads = await ConsultationLead.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      count: leads.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: leads,
    });
  } catch (error) {
    console.error('❌ Error fetching leads:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving consultation leads.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get lead statistics summary
 * @route   GET /api/consultation-leads/stats
 * @access  Public / Protected
 */
export const getLeadStats = async (req, res) => {
  try {
    const totalLeads = await ConsultationLead.countDocuments();
    const newLeads = await ConsultationLead.countDocuments({ status: 'new' });
    const contactedLeads = await ConsultationLead.countDocuments({ status: 'contacted' });
    const inProgressLeads = await ConsultationLead.countDocuments({ status: 'in_progress' });
    const convertedLeads = await ConsultationLead.countDocuments({ status: 'converted' });
    const closedLeads = await ConsultationLead.countDocuments({ status: 'closed' });

    const byService = await ConsultationLead.aggregate([
      { $group: { _id: '$lookingFor', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const byBusinessType = await ConsultationLead.aggregate([
      { $group: { _id: '$businessType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        total: totalLeads,
        byStatus: {
          new: newLeads,
          contacted: contactedLeads,
          in_progress: inProgressLeads,
          converted: convertedLeads,
          closed: closedLeads,
        },
        byService,
        byBusinessType,
      },
    });
  } catch (error) {
    console.error('❌ Error calculating lead stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching lead statistics.',
    });
  }
};

/**
 * @desc    Get single lead by ID
 * @route   GET /api/consultation-leads/:id
 * @access  Public / Protected
 */
export const getLeadById = async (req, res) => {
  try {
    const lead = await ConsultationLead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Consultation lead not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error('❌ Error fetching lead by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving lead.',
    });
  }
};

/**
 * @desc    Update lead status and notes
 * @route   PUT /api/consultation-leads/:id
 * @access  Public / Protected
 */
export const updateLead = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const lead = await ConsultationLead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Consultation lead not found.',
      });
    }

    if (status !== undefined) lead.status = status;
    if (notes !== undefined) lead.notes = notes;

    const updatedLead = await lead.save();

    return res.status(200).json({
      success: true,
      message: 'Lead updated successfully.',
      data: updatedLead,
    });
  } catch (error) {
    console.error('❌ Error updating lead:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating lead.',
    });
  }
};

/**
 * @desc    Delete a lead
 * @route   DELETE /api/consultation-leads/:id
 * @access  Public / Protected
 */
export const deleteLead = async (req, res) => {
  try {
    const lead = await ConsultationLead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Consultation lead not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lead deleted successfully.',
    });
  } catch (error) {
    console.error('❌ Error deleting lead:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting lead.',
    });
  }
};
