import type { Request, Response } from 'express';
import { VehicleService } from '../services/VehicleService';
import type {
  CreateVehicleBody,
  ListVehiclesQuery,
  UpdateVehicleBody,
} from '../types/vehicle.types';
import type { IdParam } from '../types/request.types';
import { toHandler } from '../types/request.types';
import { sendResponse } from '../utils/response.utils';

export class VehicleController {
  private readonly service = new VehicleService();

  list = toHandler(
    async (req: Request<Record<string, never>, unknown, unknown, ListVehiclesQuery>, res: Response) => {
      const result = await this.service.list(req.query);
      sendResponse(res, 200, 'Vehicles retrieved successfully', result);
    },
  );

  getById = toHandler(async (req: Request<IdParam>, res: Response) => {
    const vehicle = await this.service.getById(req.params.id);
    sendResponse(res, 200, 'Vehicle retrieved successfully', vehicle);
  });

  create = toHandler(
    async (req: Request<Record<string, never>, unknown, CreateVehicleBody>, res: Response) => {
      const vehicle = await this.service.create(req.body, req.file?.filename);
      sendResponse(res, 201, 'Vehicle created successfully', vehicle);
    },
  );

  update = toHandler(
    async (req: Request<IdParam, unknown, UpdateVehicleBody>, res: Response) => {
      const vehicle = await this.service.update(req.params.id, req.body, req.file?.filename);
      sendResponse(res, 200, 'Vehicle updated successfully', vehicle);
    },
  );

  delete = toHandler(async (req: Request<IdParam>, res: Response) => {
    await this.service.delete(req.params.id);
    sendResponse(res, 200, 'Vehicle deleted successfully');
  });
}
