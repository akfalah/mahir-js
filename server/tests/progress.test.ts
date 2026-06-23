import supertest from 'supertest';

import { server } from '../src/applications/server';
import { prisma } from '../src/applications/database';

import { createStudentToken, getStudentId } from './helpers/auth.helper';

const api = supertest(server);

describe('progress test', () => {
  let studentToken: string;
  let studentId: number;
  let conceptId: number;
  let materialId: number;
  let studyCaseId: number;

  beforeAll(async () => {
    studentToken = await createStudentToken();
    studentId = await getStudentId();

    const concept = await prisma.concept.upsert({
      where: { slug: 'test-concept-for-progress' },
      update: {},
      create: {
        slug: 'test-concept-for-progress',
        title: 'Test',
        description: 'Test',
        order: 95,
        isPublished: true,
      },
    });

    conceptId = concept.id;

    const material = await prisma.material.upsert({
      where: { slug: 'test-material-for-progress' },
      update: {},
      create: {
        conceptId,
        slug: 'test-material-for-progress',
        title: 'Test',
        content: 'Test',
        order: 1,
        isPublished: true,
      },
    });

    materialId = material.id;

    const studyCase = await prisma.studyCase.upsert({
      where: { materialId_order: { materialId, order: 1 } },
      update: { updatedAt: new Date() },
      create: {
        materialId,
        slug: 'test-sc',
        title: 'Test SC',
        description: 'Test',
        starterCode: 'function test() {}',
        order: 1,
        functionName: 'test',
        parameterNames: [],
        isPublished: true,
      },
    });

    studyCaseId = studyCase.id;

    await prisma.conceptProgress.upsert({
      where: { userId_conceptId: { userId: studentId, conceptId } },
      update: {},
      create: { userId: studentId, conceptId },
    });

    await prisma.materialProgress.upsert({
      where: { userId_materialId: { userId: studentId, materialId } },
      update: {},
      create: { userId: studentId, materialId },
    });

    await prisma.studyCaseProgress.upsert({
      where: { userId_studyCaseId: { userId: studentId, studyCaseId } },
      update: {},
      create: { userId: studentId, studyCaseId },
    });
  });

  afterAll(async () => {
    await prisma.studyCaseProgress.deleteMany({ where: { studyCaseId } });
    await prisma.materialProgress.deleteMany({ where: { materialId } });
    await prisma.conceptProgress.deleteMany({ where: { conceptId } });
    await prisma.studyCase.deleteMany({ where: { id: studyCaseId } });
    await prisma.material.deleteMany({
      where: { slug: 'test-material-for-progress' },
    });
    await prisma.concept.deleteMany({
      where: { slug: 'test-concept-for-progress' },
    });
  });

  // ------------------------------------------------------------
  // GET /progress/concepts
  // ------------------------------------------------------------
  describe('GET /api/progress/concepts', () => {
    it('should return concept progresses for student', async () => {
      const res = await api
        .get('/api/progress/concepts')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((p: any) => p.conceptId === conceptId)).toBe(
        true,
      );
    });

    it('should return 401 without token', async () => {
      const res = await api.get('/api/progress/concepts');
      expect(res.status).toBe(401);
    });
  });

  // ------------------------------------------------------------
  // GET /progress/materials
  // ------------------------------------------------------------
  describe('GET /api/progress/materials', () => {
    it('should return material progresses', async () => {
      const res = await api
        .get('/api/progress/materials')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.some((p: any) => p.materialId === materialId)).toBe(
        true,
      );
    });

    it('should filter by conceptId', async () => {
      const res = await api
        .get(`/api/progress/materials?conceptId=${conceptId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
    });
  });

  // ------------------------------------------------------------
  // GET /progress/study-cases
  // ------------------------------------------------------------
  describe('GET /api/progress/study-cases', () => {
    it('should return study case progresses', async () => {
      const res = await api
        .get('/api/progress/study-cases')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(
        res.body.data.some((p: any) => p.studyCaseId === studyCaseId),
      ).toBe(true);
    });

    it('should filter by materialId', async () => {
      const res = await api
        .get(`/api/progress/study-cases?materialId=${materialId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
    });
  });
});
