import { NextFunction, Request, Response } from 'express';

import { AuthService } from '../services/auth.service';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await AuthService.register(req.body);

      res.status(201).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await AuthService.login(req.body);

      res.status(200).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({ data: 'Logged out successfully' });
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
}
