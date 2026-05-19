import { NextFunction, Request, response, Response } from 'express';
import { PaginationRequest } from '../models/paginations.model';
import { TestCaseService } from '../services/test-case.service';

export class TestCaseController {
  static async index(req: Request, res: Response, next: NextFunction) {
    try {
      const request: PaginationRequest = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        search: (req.query.search as string) || undefined,
      };

      const response = await TestCaseService.getTestCases(request);

      res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }

  static async show(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await TestCaseService.getTestCaseById(
        Number(req.params.id),
      );

      res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }

  static async store(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await TestCaseService.createTestCase(req.body);

      res.status(201).json(response);
    } catch (e) {
      next(e);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await TestCaseService.updateTestCase(
        Number(req.params.id),
        req.body,
      );

      res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }

  static async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      await TestCaseService.deleteTestCase(Number(req.params.id));

      res.status(200).json({ data: 'Study case deleted successfully' });
    } catch (e) {
      next(e);
    }
  }
}
