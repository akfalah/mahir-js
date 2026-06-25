import { NextFunction, Request, Response } from 'express';

import { SubmissionPaginationRequest } from '../models/submission.model';

import { SubmissionService } from '../services/submission.service';

export class SubmissionController {
  static async index(req: Request, res: Response, next: NextFunction) {
    try {
      const request = {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        sortBy: req.query.sortBy,
        orderBy: req.query.orderBy,
        userId: req.query.userId,
        studyCaseId: req.query.studyCaseId,
        status: req.query.status,
      } as unknown as SubmissionPaginationRequest;

      const response = await SubmissionService.getSubmissions(
        req.user!,
        request,
      );

      res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }

  static async show(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await SubmissionService.getSubmissionById(
        req.user!,
        Number(req.params.id),
      );

      res.status(200).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async store(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await SubmissionService.createSubmission(
        req.user!,
        req.body,
      );

      res.status(201).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async run(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await SubmissionService.runSubmission(
        req.user!,
        req.body,
      );

      res.status(200).json({ data: response });
    } catch (e) {
      next(e);
    }
  }
}
