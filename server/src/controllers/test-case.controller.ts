import { NextFunction, Request, Response } from 'express';

import { TestCasePaginationRequest } from '../models/test-case.model';

import { TestCaseService } from '../services/test-case.service';

export class TestCaseController {
  static async index(req: Request, res: Response, next: NextFunction) {
    try {
      const request = {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        sortBy: req.query.sortBy,
        orderBy: req.query.orderBy,
        exerciseId: req.query.exerciseId,
        isPublished: req.query.isPublished,
      } as unknown as TestCasePaginationRequest;

      const response = await TestCaseService.getTestCases(req.user, request);

      res
        .status(200)
        .json({ message: 'Successfully retrieved test cases', ...response });
    } catch (e) {
      next(e);
    }
  }

  static async show(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await TestCaseService.getTestCaseById(
        req.user,
        Number(req.params.id),
      );

      res
        .status(200)
        .json({ message: 'Successfully retrieved test case', data: response });
    } catch (e) {
      next(e);
    }
  }

  static async store(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await TestCaseService.createTestCase(req.body);

      res
        .status(201)
        .json({ message: 'Successfully stored test case', data: response });
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

      res
        .status(200)
        .json({ message: 'Successfully updated test case', data: response });
    } catch (e) {
      next(e);
    }
  }

  static async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      await TestCaseService.deleteTestCase(Number(req.params.id));

      res.status(200).json({ message: 'Successfully deelted test case' });
    } catch (e) {
      next(e);
    }
  }
}
