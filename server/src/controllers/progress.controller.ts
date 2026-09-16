import { NextFunction, Request, Response } from 'express';

import { ProgressService } from '../services/progress.service';

export class ProgressController {
  static async moduleProgresses(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const response = await ProgressService.getModuleProgresses(req.user!);

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

  static async exerciseProgresses(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const materialId = req.query.materialId
        ? Number(req.query.materialId)
        : undefined;
      const response = await ProgressService.getExerciseProgresses(
        req.user!,
        materialId,
      );

      res.status(200).json({ data: response });
    } catch (e) {
      next(e);
    }
  }
}
