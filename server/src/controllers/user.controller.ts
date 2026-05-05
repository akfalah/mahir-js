import { Request, Response, NextFunction } from 'express';

import { GetRequest } from '../models/user.model';

import { UserService } from '../services/user.service';

export class UserController {
  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const request: GetRequest = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        search: req.query.search as string | undefined,
      };

      const response = await UserService.getUsers(request);
      res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }

  static async show(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await UserService.showUser(Number(req.params.id));
      res.status(200).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await UserService.createUser(req.body);

      res.status(201).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await UserService.updateUser(
        Number(req.params.id),
        req.body,
      );

      res.status(200).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      await UserService.deleteUser(Number(req.params.id));
      res.status(200).json({ data: 'User deleted successfully' });
    } catch (e) {
      next(e);
    }
  }
}
