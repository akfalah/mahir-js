import { prisma } from '../applications/database';

import { ResponseError } from '../errors/response.error';

import { Validation } from '../validations/validation';
import { ConceptValidation } from '../validations/concept.validation';

import {
  ConceptPaginationRequest,
  ConceptPaginationResponse,
  ConceptResponse,
  CreateConceptRequest,
  toConceptResponse,
  UpdateConceptRequest,
} from '../models/concept.model';

export class ConceptService {
  static async getConcepts(
    request: ConceptPaginationRequest,
  ): Promise<ConceptPaginationResponse> {
    const data = Validation.validate(ConceptValidation.GET, request);

    const where = {
      ...(data.search && {
        OR: [
          { title: { contains: data.search, mode: 'insensitive' as const } },
          {
            description: {
              contains: data.search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
    };

    const skip = (data.page - 1) * data.limit;

    const [concepts, total] = await Promise.all([
      prisma.concept.findMany({
        where,
        skip,
        take: data.limit,
        orderBy: { [data.sortBy as string]: data.orderBy },
      }),
      prisma.concept.count({ where }),
    ]);

    return {
      data: concepts.map(toConceptResponse),
      pagination: {
        page: data.page,
        limit: data.limit,
        total,
        totalPages: Math.ceil(total / data.limit),
      },
    };
  }

  static async getConceptById(id: number): Promise<ConceptResponse> {
    const concept = await prisma.concept.findUnique({ where: { id } });

    if (!concept) throw new ResponseError(404, 'Concept not found');

    return toConceptResponse(concept);
  }

  static async createConcept(
    request: CreateConceptRequest,
  ): Promise<ConceptResponse> {
    const data = Validation.validate(ConceptValidation.CREATE, request);

    const [slugExists, orderExists] = await Promise.all([
      prisma.concept.count({ where: { slug: data.slug } }),
      prisma.concept.count({ where: { order: data.order } }),
    ]);

    if (slugExists) throw new ResponseError(400, 'Slug already exists');
    if (orderExists) throw new ResponseError(400, 'Order already exists');

    const concept = await prisma.concept.create({ data });

    return toConceptResponse(concept);
  }

  static async updateConcept(
    id: number,
    request: UpdateConceptRequest,
  ): Promise<ConceptResponse> {
    const data = Validation.validate(ConceptValidation.UPDATE, request);

    const exists = await prisma.concept.findUnique({ where: { id } });

    if (!exists) throw new ResponseError(404, 'Concept not found');

    if (data.slug) {
      const slugExists = await prisma.concept.count({
        where: { slug: data.slug, NOT: { id } },
      });

      if (slugExists) throw new ResponseError(400, 'Slug already exists');
    }

    if (data.order) {
      const orderExists = await prisma.concept.count({
        where: { order: data.order, NOT: { id } },
      });

      if (orderExists) throw new ResponseError(400, 'Order already exists');
    }

    const concept = await prisma.concept.update({ where: { id }, data });

    return toConceptResponse(concept);
  }

  static async deleteConcept(id: number): Promise<void> {
    const concept = await prisma.concept.findUnique({ where: { id } });

    if (!concept) throw new ResponseError(404, 'Concept not found');

    await prisma.concept.delete({ where: { id } });
  }
}
