import { Router } from 'express';
import { RentalController } from '../controllers/RentalController';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createRentalSchema,
  listRentalsQuerySchema,
  rentalIdParamSchema,
  updateRentalSchema,
} from '../validators/rental.validator';

const router = Router();
const controller = new RentalController();

router.use(authMiddleware);

router.get('/', validate(listRentalsQuerySchema, 'query'), controller.list);
router.get('/:id', validate(rentalIdParamSchema, 'params'), controller.getById);
router.post('/', validate(createRentalSchema), controller.create);
router.put(
  '/:id',
  validate(rentalIdParamSchema, 'params'),
  validate(updateRentalSchema),
  controller.update,
);
router.delete('/:id', validate(rentalIdParamSchema, 'params'), controller.delete);

export default router;
