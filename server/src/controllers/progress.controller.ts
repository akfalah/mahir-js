import { NextFunction, Request, Response } from 'express';

import { ProgressService } from '../services/progress.service';

export class ProgressController {
  static async conceptProgresses(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const response = await ProgressService.getConceptProgresses(req.user!);

      res.status(200).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async materialProgresses(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const conceptId = req.query.conceptId
        ? Number(req.query.conceptId)
        : undefined;
      const response = await ProgressService.getMaterialProgresses(
        req.user!,
        conceptId,
      );

      res.status(200).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async studyCaseProgresses(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const materialId = req.query.materialId
        ? Number(req.query.materialId)
        : undefined;
      const response = await ProgressService.getStudyCaseProgresses(
        req.user!,
        materialId,
      );

      res.status(200).json({ data: response });
    } catch (e) {
      next(e);
    }
  }
}
