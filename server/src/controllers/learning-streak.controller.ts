import { NextFunction, Request, Response } from 'express';
import { LearningStreakService } from '../services/learning-streak.service';

export class LearningStreakController {
  static async index(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await LearningStreakService.getLearningStreak(req.user!);

      res.json({
        message: 'Successfully retrieved learning streak',
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }
}
