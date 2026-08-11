import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  listVehiclesQuerySchema,
  vehicleIdParamSchema,
} from '../validators/vehicle.validator';
import { VehicleService } from '../services/VehicleService';
import type { ListVehiclesQuery } from '../types/vehicle.types';

const router = Router();
const vehicleService = new VehicleService();

router.use(authMiddleware);

router.get('/', validate(listVehiclesQuerySchema, 'query'), async (req, res) => {
  const query = req.validated?.query as ListVehiclesQuery;
  const result = await vehicleService.list(query);
  res.json(result);
});

router.get('/:id', validate(vehicleIdParamSchema, 'params'), async (req, res) => {
  const { id } = req.validated?.params as { id: number };
  const vehicle = await vehicleService.getById(id);
  res.json(vehicle);
});

export default router;
