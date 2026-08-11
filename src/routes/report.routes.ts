import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { rentalsReportQuerySchema } from '../validators/report.validator';
import { ReportService } from '../services/ReportService';
import type { RentalsReportQuery } from '../types/report.types';

const router = Router();
const reportService = new ReportService();

router.use(authMiddleware);

router.get('/rentals', validate(rentalsReportQuerySchema, 'query'), async (req, res) => {
  const query = req.validated?.query as RentalsReportQuery;
  const report = await reportService.getRentalsReport(query);
  res.json(report);
});

export default router;
