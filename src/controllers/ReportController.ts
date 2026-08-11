import type { Request, Response } from 'express';
import { ReportService } from '../services/ReportService';
import type { RentalsReportQuery } from '../types/report.types';
import { toHandler } from '../types/request.types';
import { sendResponse } from '../utils/response.utils';

export class ReportController {
  private readonly service = new ReportService();

  getRentalsReport = toHandler(
    async (req: Request<Record<string, never>, unknown, unknown, RentalsReportQuery>, res: Response) => {
      const report = await this.service.getRentalsReport(req.query);
      sendResponse(res, 200, 'Report generated successfully', report);
    },
  );
}
