import { Router } from 'express';
import { HealthController } from '../controllers/HealthController';
import authRoutes from './auth.routes';
import vehicleRoutes from './vehicle.routes';
import rentalRoutes from './rental.routes';
import reportRoutes from './report.routes';

const router = Router();
const healthController = new HealthController();

router.get('/', healthController.getStatus);

router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/rentals', rentalRoutes);
router.use('/reports', reportRoutes);

export default router;
