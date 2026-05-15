import { NextFunction, Request, Response } from 'express';
import { PaginationRequest } from '../models/paginations.model';
import { MaterialService } from '../services/material.service';

export class MaterialController {
  static async index(req: Request, res: Response, next: NextFunction) {
    try {
      const request: PaginationRequest = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        search: req.query.search as string | undefined,
      };

      const response = await MaterialService.getMaterials(request);

      res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }

  static async show(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await MaterialService.getMaterialById(
        Number(req.params.id),
      );

      res.status(200).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async store(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await MaterialService.createMaterial(req.body);

      res.status(201).json({ data: response });
    } catch (e) {
      next(e);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await MaterialService.updateMaterial(
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
      await MaterialService.deleteMaterial(Number(req.params.id));

      res.status(200).json({ data: 'Material deleted successfully' });
    } catch (e) {
      next(e);
    }
  }
}
