import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  listRentalsQuerySchema,
  rentalIdParamSchema,
} from '../validators/rental.validator';
import { RentalService } from '../services/RentalService';
import type { ListRentalsQuery } from '../types/rental.types';

const router = Router();
const rentalService = new RentalService();

router.use(authMiddleware);

router.get('/', validate(listRentalsQuerySchema, 'query'), async (req, res) => {
  const query = req.validated?.query as ListRentalsQuery;
  const rentals = await rentalService.list(query);
  res.json(rentals);
});

router.get('/:id', validate(rentalIdParamSchema, 'params'), async (req, res) => {
  const { id } = req.validated?.params as { id: number };
  const rental = await rentalService.getById(id);
  res.json(rental);
});

export default router;
