import { NextFunction, Request, Response } from 'express';

import { ConceptPaginationRequest } from '../models/concept.model';

import { ConceptService } from '../services/concept.service';

export class ConceptController {
  static async index(req: Request, res: Response, next: NextFunction) {
    try {
      const request = {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        sortBy: req.query.sortBy,
        orderBy: req.query.orderBy,
      } as unknown as ConceptPaginationRequest;

      const response = await ConceptService.getConcepts(request);

      res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }

  static async show(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await ConceptService.getConceptById(
        Number(req.params.id),
      );

      res.status(200).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async store(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await ConceptService.createConcept(req.body);

      res.status(201).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await ConceptService.updateConcept(
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
      await ConceptService.deleteConcept(Number(req.params.id));

      res.status(200).json({ data: 'Concept deleted successfully' });
    } catch (e) {
      next(e);
    }
  }
}
