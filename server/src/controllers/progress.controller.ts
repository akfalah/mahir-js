import { NextFunction, Request, Response } from 'express';

import { ProgressService } from '../services/progress.service';

export class ProgressController {
  static async overviewProgress(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const response = await ProgressService.getOverview(req.user!);

      res.status(200).json({
        message: 'Successfully retrieved overview progress',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async moduleProgress(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const response = await ProgressService.getModuleProgress(req.user!);

      res.status(200).json({
        message: 'Successfully retrieved module progress',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async materialProgress(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const moduleId = req.query.moduleId
        ? Number(req.query.moduleId)
        : undefined;
      const response = await ProgressService.getMaterialProgress(
        req.user!,
        moduleId,
      );

      res.status(200).json({
        message: 'Successfully retrieved material progress',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async exerciseProgress(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const materialId = req.query.materialId
        ? Number(req.query.materialId)
        : undefined;
      const response = await ProgressService.getExerciseProgress(
        req.user!,
        materialId,
      );

      res.status(200).json({
        message: 'Successfully retrieved exercise progress',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }
}
