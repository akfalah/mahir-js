import { NextFunction, Request, Response } from 'express';

import { StudyCasePaginationRequest } from '../models/study-case.model';

import { StudyCaseService } from '../services/study-case.service';

export class StudyCaseController {
  static async index(req: Request, res: Response, next: NextFunction) {
    try {
      const request = {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        sortBy: req.query.sortBy,
        orderBy: req.query.orderBy,
        materialId: req.query.materialId,
      } as unknown as StudyCasePaginationRequest;

      const response = await StudyCaseService.getStudyCases(request);

      res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }

  static async show(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await StudyCaseService.getStudyCaseById(
        Number(req.params.id),
      );

      res.status(200).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async store(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await StudyCaseService.createStudyCase(req.body);

      res.status(201).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await StudyCaseService.updateStudyCase(
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
      await StudyCaseService.deleteStudyCase(Number(req.params.id));

      res.status(200).json({ data: 'Study case deleted successfully' });
    } catch (e) {
      next(e);
    }
  }
}
