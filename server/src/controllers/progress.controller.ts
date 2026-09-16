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

      res.status(200).json({
        message: 'Successfully retrieved module progresses',
        data: response,
      });
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
      const moduleId = req.query.moduleId
        ? Number(req.query.moduleId)
        : undefined;
      const response = await ProgressService.getMaterialProgresses(
        req.user!,
        moduleId,
      );

      res.status(200).json({
        message: 'Successfully retrieved material progresses',
        data: response,
      });
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

      res.status(200).json({
        message: 'Successfully retrieved exercise progresses',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }
}
