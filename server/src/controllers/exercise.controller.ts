import { NextFunction, Request, Response } from 'express';

import { ExercisePaginationRequest } from '../models/exercise.model';

import { ExerciseService } from '../services/exercise.service';

export class ExerciseController {
  static async index(req: Request, res: Response, next: NextFunction) {
    try {
      const request = {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        sortBy: req.query.sortBy,
        orderBy: req.query.orderBy,
        materialId: req.query.materialId,
        isPublished: req.query.isPublished,
      } as unknown as ExercisePaginationRequest;

      const response = await ExerciseService.getExercises(req.user, request);

      res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }

  static async show(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await ExerciseService.getExerciseBySlug(
        req.user,
        req.params.slug.toString(),
      );

      res.status(200).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async store(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await ExerciseService.createExercise(req.body);

      res.status(201).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await ExerciseService.updateExercise(
        Number(req.params.id),
        req.body,
      );

      res.status(200).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      await ExerciseService.deleteExercise(Number(req.params.id));

      res.status(200).json({ data: 'Study case deleted successfully' });
    } catch (e) {
      next(e);
    }
  }
}
