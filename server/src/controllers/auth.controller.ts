import { NextFunction, Request, Response } from 'express';

import { AuthService } from '../services/auth.service';

export class AuthController {
  static async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await AuthService.signUp(req.body);

      res.status(201).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async signIn(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await AuthService.signIn(req.body);

      res.status(200).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async profile(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await AuthService.profile(req.user!.id);

      res.status(200).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await AuthService.updateProfile(req.user!.id, req.body);

      res.status(200).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.updatePassword(req.user!.id, req.body);
      res.status(200).json({ data: 'Password changed successfully' });
    } catch (e) {
      next(e);
    }
  }
}
