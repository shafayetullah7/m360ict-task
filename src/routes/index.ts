import { Router } from 'express';
import authRoutes from './auth.routes';
import vehicleRoutes from './vehicle.routes';
import rentalRoutes from './rental.routes';
import reportRoutes from './report.routes';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ message: 'API is running' });
});

router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/rentals', rentalRoutes);
router.use('/reports', reportRoutes);

export default router;
