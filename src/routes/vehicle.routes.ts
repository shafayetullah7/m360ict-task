import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadPhoto } from '../middleware/upload.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createVehicleSchema,
  listVehiclesQuerySchema,
  updateVehicleSchema,
  vehicleIdParamSchema,
} from '../validators/vehicle.validator';
import { VehicleService } from '../services/VehicleService';
import type {
  CreateVehicleBody,
  ListVehiclesQuery,
  UpdateVehicleBody,
} from '../types/vehicle.types';

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

router.post('/', uploadPhoto, validate(createVehicleSchema), async (req, res) => {
  const body = req.validated?.body as CreateVehicleBody;
  const photoPath = req.file?.filename;
  const vehicle = await vehicleService.create(body, photoPath);
  res.status(201).json(vehicle);
});

router.put(
  '/:id',
  validate(vehicleIdParamSchema, 'params'),
  uploadPhoto,
  validate(updateVehicleSchema),
  async (req, res) => {
    const { id } = req.validated?.params as { id: number };
    const body = (req.validated?.body as UpdateVehicleBody) ?? {};
    const photoPath = req.file?.filename;
    const vehicle = await vehicleService.update(id, body, photoPath);
    res.json(vehicle);
  },
);

router.delete('/:id', validate(vehicleIdParamSchema, 'params'), async (req, res) => {
  const { id } = req.validated?.params as { id: number };
  await vehicleService.delete(id);
  res.status(204).send();
});

export default router;
