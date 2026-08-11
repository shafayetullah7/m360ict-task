import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { rentalsReportQuerySchema } from '../validators/report.validator';

const router = Router();
const controller = new ReportController();

router.use(authMiddleware);

router.get('/rentals', validate(rentalsReportQuerySchema, 'query'), controller.getRentalsReport);

export default router;
