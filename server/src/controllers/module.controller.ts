import { NextFunction, Request, Response } from 'express';

import { ModulePaginationRequest } from '../models/module.model';

import { ModuleService } from '../services/module.service';

export class ModuleController {
  static async index(req: Request, res: Response, next: NextFunction) {
    try {
      const request = {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        sortBy: req.query.sortBy,
        orderBy: req.query.orderBy,
        isPublished: req.query.isPublished,
      } as unknown as ModulePaginationRequest;

      const response = await ModuleService.getModules(req.user, request);

      res
        .status(200)
        .json({ message: 'Successfully retrieved modules', ...response });
    } catch (e) {
      next(e);
    }
  }

  static async show(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await ModuleService.getModuleBySlug(
        req.user,
        req.params.slug.toString(),
      );

      res
        .status(200)
        .json({ message: 'Successfully retrieved module', data: response });
    } catch (e) {
      next(e);
    }
  }

  static async store(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await ModuleService.createModule(req.body);

      res
        .status(201)
        .json({ message: 'Successfully stored module', data: response });
    } catch (e) {
      next(e);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await ModuleService.updateModule(
        Number(req.params.id),
        req.body,
      );

      res
        .status(200)
        .json({ message: 'Successfully updated module', data: response });
    } catch (e) {
      next(e);
    }
  }

  static async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      await ModuleService.deleteModule(Number(req.params.id));

      res.status(200).json({ message: 'Successfully deleted module' });
    } catch (e) {
      next(e);
    }
  }
}
