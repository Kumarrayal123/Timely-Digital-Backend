import express from 'express';
import {
  createLead,
  getAllLeads,
  getLeadStats,
  getLeadById,
  updateLead,
  deleteLead,
} from '../controllers/leadController.js';

const router = express.Router();

// Lead statistics summary
router.get('/stats', getLeadStats);

// Lead collection routes
router.route('/')
  .post(createLead)
  .get(getAllLeads);

// Individual lead routes
router.route('/:id')
  .get(getLeadById)
  .put(updateLead)
  .delete(deleteLead);

export default router;
