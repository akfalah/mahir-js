import { Request, Response, NextFunction } from 'express';

import { GetUsersRequest } from '../models/user.model';

import { UserService } from '../services/user.service';

export class UserController {
  static async index(req: Request, res: Response, next: NextFunction) {
    try {
      const request: GetUsersRequest = {
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
      const response = await UserService.getUserById(Number(req.params.id));
      res.status(200).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async store(req: Request, res: Response, next: NextFunction) {
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

  static async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      await UserService.deleteUser(Number(req.params.id));
      res.status(200).json({ data: 'User deleted successfully' });
    } catch (e) {
      next(e);
    }
  }
}
