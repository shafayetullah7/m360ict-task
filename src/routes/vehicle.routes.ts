import { Router } from 'express';
import { VehicleController } from '../controllers/VehicleController';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadPhoto } from '../middleware/upload.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createVehicleSchema,
  listVehiclesQuerySchema,
  updateVehicleSchema,
  vehicleIdParamSchema,
} from '../validators/vehicle.validator';

const router = Router();
const controller = new VehicleController();

router.use(authMiddleware);

router.get('/', validate(listVehiclesQuerySchema, 'query'), controller.list);
router.get('/:id', validate(vehicleIdParamSchema, 'params'), controller.getById);
router.post('/', uploadPhoto, validate(createVehicleSchema), controller.create);
router.put(
  '/:id',
  validate(vehicleIdParamSchema, 'params'),
  uploadPhoto,
  validate(updateVehicleSchema),
  controller.update,
);
router.delete('/:id', validate(vehicleIdParamSchema, 'params'), controller.delete);

export default router;
