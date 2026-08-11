import type { Request, Response } from 'express';
import { RentalService } from '../services/RentalService';
import type { CreateRentalBody, ListRentalsQuery, UpdateRentalBody } from '../types/rental.types';
import type { IdParam } from '../types/request.types';
import { toHandler } from '../types/request.types';
import { sendResponse } from '../utils/response.utils';

export class RentalController {
  private readonly service = new RentalService();

  list = toHandler(
    async (req: Request<Record<string, never>, unknown, unknown, ListRentalsQuery>, res: Response) => {
      const rentals = await this.service.list(req.query);
      sendResponse(res, 200, 'Rentals retrieved successfully', rentals);
    },
  );

  getById = toHandler(async (req: Request<IdParam>, res: Response) => {
    const rental = await this.service.getById(req.params.id);
    sendResponse(res, 200, 'Rental retrieved successfully', rental);
  });

  create = toHandler(
    async (req: Request<Record<string, never>, unknown, CreateRentalBody>, res: Response) => {
      const rental = await this.service.create(req.body);
      sendResponse(res, 201, 'Rental created successfully', rental);
    },
  );

  update = toHandler(
    async (req: Request<IdParam, unknown, UpdateRentalBody>, res: Response) => {
      const rental = await this.service.update(req.params.id, req.body);
      sendResponse(res, 200, 'Rental updated successfully', rental);
    },
  );

  delete = toHandler(async (req: Request<IdParam>, res: Response) => {
    await this.service.delete(req.params.id);
    sendResponse(res, 200, 'Rental cancelled successfully');
  });
}
