import { prisma } from '../applications/database';
import { ResponseError } from '../error/response.error';
import {
  ConceptResponse,
  CreateConceptRequest,
  GetConceptsResponse,
  toConceptResponse,
  UpdateConceptRequest,
} from '../models/concept.model';
import { PaginationRequest } from '../models/paginations.model';
import { ConceptValidation } from '../validations/concept.validation';
import { PaginationValidation } from '../validations/pagination.validation';
import { Validation } from '../validations/validation';

export class ConceptService {
  static async getConcepts(
    request: PaginationRequest,
  ): Promise<GetConceptsResponse> {
    const data = Validation.validate(PaginationValidation, request);

    const where = data.search
      ? {
          OR: [
            { title: { contains: data.search, mode: 'insensitive' as const } },
            {
              description: {
                contains: data.search,
                mode: 'insensitive' as const,
              },
            },
          ],
          deletedAt: null,
        }
      : { deletedAt: null };

    const skip = (data.page - 1) * data.limit;

    const [concepts, total] = await Promise.all([
      prisma.concept.findMany({
        where,
        skip,
        take: data.limit,
        orderBy: { order: 'asc' },
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
    const concept = await prisma.concept.findFirst({
      where: { id, deletedAt: null },
    });

    if (!concept) throw new ResponseError(404, 'Concept not found');

    return toConceptResponse(concept);
  }

  static async createConcept(
    request: CreateConceptRequest,
  ): Promise<ConceptResponse> {
    const data = Validation.validate(ConceptValidation.CREATE, request);

    const [countSlug, countOrder] = await Promise.all([
      prisma.concept.count({ where: { slug: data.slug } }),
      prisma.concept.count({ where: { order: data.order } }),
    ]);

    if (countSlug !== 0) throw new ResponseError(400, 'Slug already exists');
    if (countOrder !== 0) throw new ResponseError(400, 'Order already exists');

    const concept = await prisma.concept.create({
      data: data,
    });

    return toConceptResponse(concept);
  }

  static async updateConcept(
    id: number,
    request: UpdateConceptRequest,
  ): Promise<ConceptResponse> {
    const data = Validation.validate(ConceptValidation.UPDATE, request);

    const exists = await prisma.concept.findFirst({
      where: { id, deletedAt: null },
    });

    if (!exists) throw new ResponseError(404, 'Concept not found');

    if (data.slug && data.slug !== exists.slug) {
      const count = await prisma.concept.count({
        where: { slug: data.slug, NOT: { id } },
      });
      if (count !== 0) throw new ResponseError(400, 'Slug already exists');
    }

    if (data.order && data.order !== exists.order) {
      const count = await prisma.concept.count({
        where: { order: data.order, NOT: { id } },
      });
      if (count !== 0) throw new ResponseError(400, 'Order already exists');
    }

    const concept = await prisma.concept.update({
      where: { id },
      data,
    });

    return toConceptResponse(concept);
  }

  static async deleteConceptTest(id: number): Promise<void> {
    const concept = await prisma.concept.findFirst({
      where: { id, deletedAt: null },
    });

    if (!concept) throw new ResponseError(404, 'Concept not found');

    await prisma.concept.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
