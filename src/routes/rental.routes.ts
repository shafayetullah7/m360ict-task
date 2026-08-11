import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createRentalSchema,
  listRentalsQuerySchema,
  rentalIdParamSchema,
  updateRentalSchema,
} from '../validators/rental.validator';
import { RentalService } from '../services/RentalService';
import type { CreateRentalBody, ListRentalsQuery, UpdateRentalBody } from '../types/rental.types';

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

router.post('/', validate(createRentalSchema), async (req, res) => {
  const body = req.validated?.body as CreateRentalBody;
  const rental = await rentalService.create(body);
  res.status(201).json(rental);
});

router.put(
  '/:id',
  validate(rentalIdParamSchema, 'params'),
  validate(updateRentalSchema),
  async (req, res) => {
    const { id } = req.validated?.params as { id: number };
    const body = req.validated?.body as UpdateRentalBody;
    const rental = await rentalService.update(id, body);
    res.json(rental);
  },
);

router.delete('/:id', validate(rentalIdParamSchema, 'params'), async (req, res) => {
  const { id } = req.validated?.params as { id: number };
  await rentalService.delete(id);
  res.status(204).send();
});

export default router;
