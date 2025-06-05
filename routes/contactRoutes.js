import express from 'express';
import { submitContactForm } from '../controllers/contactController.js';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();

router.post('/', submitContactForm);

export default router; 