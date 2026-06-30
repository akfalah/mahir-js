import supertest from 'supertest';

import { Role } from '../generated/prisma/enums';

import { server } from '../src/applications/server';

import {
  authHeader,
  cleanupTestData,
  createConceptFixture,
  createMaterialFixture,
  createStudyCaseFixture,
  createTestCaseFixture,
  createTestPrefix,
  createUserFixture,
  nextOrder,
} from './helpers/test-data.helper';

const api = supertest(server);

const prefix = createTestPrefix('content');

describe('content model endpoints', () => {
  let adminToken: string;
  let studentToken: string;

  beforeAll(async () => {
    await cleanupTestData(prefix);
    adminToken = (await createUserFixture({ prefix, label: 'admin', role: Role.ADMIN })).token;
    studentToken = (await createUserFixture({ prefix, label: 'student', role: Role.STUDENT })).token;
  });

  afterAll(async () => {
    await cleanupTestData(prefix);
  });

  describe('concepts', () => {
    let conceptId: number;
    let unpublishedConceptId: number;
    const conceptOrder = nextOrder();
    const unpublishedConceptOrder = nextOrder();

    it('creates published and unpublished concepts as admin', async () => {
      const published = await api
        .post('/api/concepts')
        .set(authHeader(adminToken))
        .send({
          slug: `${prefix}-concept`,
          title: `${prefix} Concept`,
          description: 'Concept description',
          order: conceptOrder,
          isPublished: true,
        });

      const unpublished = await api
        .post('/api/concepts')
        .set(authHeader(adminToken))
        .send({
          slug: `${prefix}-concept-draft`,
          title: `${prefix} Draft Concept`,
          description: 'Draft concept description',
          order: unpublishedConceptOrder,
          isPublished: false,
        });

      expect(published.status).toBe(201);
      expect(unpublished.status).toBe(201);
      conceptId = published.body.data.id;
      unpublishedConceptId = unpublished.body.data.id;
    });

    it('enforces concept authorization and validation', async () => {
      const guest = await api.post('/api/concepts').send({});
      const student = await api
        .post('/api/concepts')
        .set(authHeader(studentToken))
        .send({ slug: `${prefix}-forbidden`, title: 'Forbidden', description: 'Forbidden', order: nextOrder() });
      const duplicateSlug = await api
        .post('/api/concepts')
        .set(authHeader(adminToken))
        .send({ slug: `${prefix}-concept`, title: 'Duplicate', description: 'Duplicate', order: nextOrder() });
      const duplicateOrder = await api
        .post('/api/concepts')
        .set(authHeader(adminToken))
        .send({ slug: `${prefix}-duplicate-order`, title: 'Duplicate', description: 'Duplicate', order: conceptOrder });
      const invalid = await api
        .post('/api/concepts')
        .set(authHeader(adminToken))
        .send({ slug: 'ab', title: 'ab', description: 'ab', order: 0 });

      expect(guest.status).toBe(401);
      expect(student.status).toBe(403);
      expect(duplicateSlug.status).toBe(400);
      expect(duplicateOrder.status).toBe(400);
      expect(invalid.status).toBe(400);
    });

    it('lists, searches, filters, and protects unpublished concepts', async () => {
      const guestList = await api.get(`/api/concepts?search=${prefix}`);
      const studentList = await api
        .get(`/api/concepts?search=${prefix}`)
        .set(authHeader(studentToken));
      const adminDrafts = await api
        .get(`/api/concepts?search=${prefix}&isPublished=false`)
        .set(authHeader(adminToken));
      const sorted = await api.get('/api/concepts?sortBy=order&orderBy=asc');
      const invalidPage = await api.get('/api/concepts?page=abc');
      const invalidLimit = await api.get('/api/concepts?limit=200');

      expect(guestList.status).toBe(200);
      expect(studentList.status).toBe(200);
      expect(guestList.body.data.every((concept: any) => concept.isPublished)).toBe(true);
      expect(studentList.body.data.every((concept: any) => concept.isPublished)).toBe(true);
      expect(adminDrafts.status).toBe(200);
      expect(adminDrafts.body.data.some((concept: any) => concept.id === unpublishedConceptId)).toBe(true);
      expect(sorted.status).toBe(200);
      expect(invalidPage.status).toBe(400);
      expect(invalidLimit.status).toBe(400);
    });

    it('shows published concepts to everyone and unpublished concepts only to admin', async () => {
      const guestPublished = await api.get(`/api/concepts/${prefix}-concept`);
      const studentPublished = await api
        .get(`/api/concepts/${prefix}-concept`)
        .set(authHeader(studentToken));
      const guestDraft = await api.get(`/api/concepts/${prefix}-concept-draft`);
      const studentDraft = await api
        .get(`/api/concepts/${prefix}-concept-draft`)
        .set(authHeader(studentToken));
      const adminDraft = await api
        .get(`/api/concepts/${prefix}-concept-draft`)
        .set(authHeader(adminToken));

      expect(guestPublished.status).toBe(200);
      expect(studentPublished.status).toBe(200);
      expect(guestDraft.status).toBe(404);
      expect(studentDraft.status).toBe(404);
      expect(adminDraft.status).toBe(200);
    });

    it('updates, publishes, unpublishes, and deletes concepts as admin', async () => {
      const update = await api
        .patch(`/api/concepts/${conceptId}`)
        .set(authHeader(adminToken))
        .send({ title: `${prefix} Updated Concept` });
      const forbidden = await api
        .patch(`/api/concepts/${conceptId}`)
        .set(authHeader(studentToken))
        .send({ title: 'Forbidden' });
      const unpublish = await api
        .patch(`/api/concepts/${conceptId}`)
        .set(authHeader(adminToken))
        .send({ isPublished: false });
      const publish = await api
        .patch(`/api/concepts/${conceptId}`)
        .set(authHeader(adminToken))
        .send({ isPublished: true });
      const missing = await api
        .patch('/api/concepts/99999999')
        .set(authHeader(adminToken))
        .send({ title: 'Missing' });
      const deleteDraft = await api
        .delete(`/api/concepts/${unpublishedConceptId}`)
        .set(authHeader(adminToken));

      expect(update.status).toBe(200);
      expect(forbidden.status).toBe(403);
      expect(unpublish.status).toBe(200);
      expect(publish.status).toBe(200);
      expect(missing.status).toBe(404);
      expect(deleteDraft.status).toBe(200);
    });
  });

  describe('materials', () => {
    let conceptId: number;
    let materialId: number;
    let draftMaterialId: number;

    beforeAll(async () => {
      const concept = await createConceptFixture({ prefix, label: 'material-parent', order: nextOrder() });
      conceptId = concept.id;
    });

    it('creates materials and sanitizes rich text content', async () => {
      const published = await api
        .post('/api/materials')
        .set(authHeader(adminToken))
        .send({
          conceptId,
          slug: `${prefix}-material`,
          title: `${prefix} Material`,
          description: 'Material description',
          content: '<h2>Hello</h2><script>alert("xss")</script><p>Safe content</p>',
          order: 1,
          isPublished: true,
        });
      const draft = await api
        .post('/api/materials')
        .set(authHeader(adminToken))
        .send({
          conceptId,
          slug: `${prefix}-material-draft`,
          title: `${prefix} Draft Material`,
          description: 'Draft material description',
          content: '<p>Draft content</p>',
          order: 2,
          isPublished: false,
        });

      expect(published.status).toBe(201);
      expect(published.body.data.content).toContain('<h2>Hello</h2>');
      expect(published.body.data.content).not.toContain('<script>');
      expect(draft.status).toBe(201);
      materialId = published.body.data.id;
      draftMaterialId = draft.body.data.id;
    });

    it('enforces material authorization and validation', async () => {
      const guest = await api.post('/api/materials').send({});
      const student = await api.post('/api/materials').set(authHeader(studentToken)).send({});
      const missingConcept = await api.post('/api/materials').set(authHeader(adminToken)).send({
        conceptId: 99999999,
        slug: `${prefix}-missing-concept-material`,
        title: 'Missing Concept',
        description: 'Missing concept material',
        content: '<p>Content</p>',
        order: 3,
      });
      const duplicateSlug = await api.post('/api/materials').set(authHeader(adminToken)).send({
        conceptId,
        slug: `${prefix}-material`,
        title: 'Duplicate Slug',
        description: 'Duplicate slug material',
        content: '<p>Content</p>',
        order: 3,
      });
      const duplicateOrder = await api.post('/api/materials').set(authHeader(adminToken)).send({
        conceptId,
        slug: `${prefix}-material-duplicate-order`,
        title: 'Duplicate Order',
        description: 'Duplicate order material',
        content: '<p>Content</p>',
        order: 1,
      });
      const emptyContent = await api.post('/api/materials').set(authHeader(adminToken)).send({
        conceptId,
        slug: `${prefix}-empty-content`,
        title: 'Empty Content',
        description: 'Empty content material',
        content: '<script>alert("x")</script>',
        order: 3,
      });

      expect(guest.status).toBe(401);
      expect(student.status).toBe(403);
      expect(missingConcept.status).toBe(404);
      expect(duplicateSlug.status).toBe(400);
      expect(duplicateOrder.status).toBe(400);
      expect(emptyContent.status).toBe(400);
    });

    it('lists, sorts, filters, and protects unpublished materials', async () => {
      const sortedWithoutConcept = await api.get('/api/materials?sortBy=order');
      const sortedWithConcept = await api.get(`/api/materials?conceptId=${conceptId}&sortBy=order&orderBy=asc`);
      const guestList = await api.get(`/api/materials?search=${prefix}`);
      const adminDrafts = await api.get(`/api/materials?isPublished=false&search=${prefix}`).set(authHeader(adminToken));
      const invalidPage = await api.get('/api/materials?page=abc');

      expect(sortedWithoutConcept.status).toBe(400);
      expect(sortedWithConcept.status).toBe(200);
      expect(guestList.status).toBe(200);
      expect(guestList.body.data.every((material: any) => material.isPublished)).toBe(true);
      expect(adminDrafts.status).toBe(200);
      expect(adminDrafts.body.data.some((material: any) => material.id === draftMaterialId)).toBe(true);
      expect(invalidPage.status).toBe(400);
    });

    it('shows published materials to everyone and unpublished materials only to admin', async () => {
      const guestPublished = await api.get(`/api/materials/${prefix}-material`);
      const studentPublished = await api.get(`/api/materials/${prefix}-material`).set(authHeader(studentToken));
      const guestDraft = await api.get(`/api/materials/${prefix}-material-draft`);
      const adminDraft = await api.get(`/api/materials/${prefix}-material-draft`).set(authHeader(adminToken));

      expect(guestPublished.status).toBe(200);
      expect(studentPublished.status).toBe(200);
      expect(guestDraft.status).toBe(404);
      expect(adminDraft.status).toBe(200);
    });

    it('updates and deletes materials as admin', async () => {
      const update = await api.patch(`/api/materials/${materialId}`).set(authHeader(adminToken)).send({
        title: `${prefix} Updated Material`,
        content: '<p>Updated safe content</p><script>bad()</script>',
      });
      const duplicateOrder = await api.patch(`/api/materials/${materialId}`).set(authHeader(adminToken)).send({ order: 2 });
      const forbidden = await api.patch(`/api/materials/${materialId}`).set(authHeader(studentToken)).send({ title: 'Forbidden' });
      const missing = await api.patch('/api/materials/99999999').set(authHeader(adminToken)).send({ title: 'Missing' });
      const deleteDraft = await api.delete(`/api/materials/${draftMaterialId}`).set(authHeader(adminToken));

      expect(update.status).toBe(200);
      expect(update.body.data.content).not.toContain('<script>');
      expect(duplicateOrder.status).toBe(400);
      expect(forbidden.status).toBe(403);
      expect(missing.status).toBe(404);
      expect(deleteDraft.status).toBe(200);
    });
  });

  describe('study cases and test cases', () => {
    let materialId: number;
    let studyCaseId: number;
    let draftStudyCaseId: number;
    let testCaseId: number;
    let draftTestCaseId: number;

    beforeAll(async () => {
      const concept = await createConceptFixture({ prefix, label: 'assessment-parent', order: nextOrder() });
      const material = await createMaterialFixture({ prefix, conceptId: concept.id, label: 'assessment-material' });
      materialId = material.id;
    });

    it('creates study cases with syntax rules and metadata', async () => {
      const published = await api.post('/api/study-cases').set(authHeader(adminToken)).send({
        materialId,
        slug: `${prefix}-study-case`,
        title: `${prefix} Study Case`,
        description: 'Study case description',
        hint: 'Use an if statement.',
        order: 1,
        starterCode: 'if (age >= 18) { return true; } return false;',
        syntaxRules: { required: ['IfStatement'], forbidden: ['ImportDeclaration'] },
        parameterNames: ['age'],
        functionName: 'isAdult',
        isPublished: true,
      });
      const draft = await api.post('/api/study-cases').set(authHeader(adminToken)).send({
        materialId,
        slug: `${prefix}-study-case-draft`,
        title: `${prefix} Draft Study Case`,
        description: 'Draft study case description',
        order: 2,
        starterCode: 'return age >= 18;',
        syntaxRules: { required: [], forbidden: [] },
        parameterNames: ['age'],
        functionName: 'isAdult',
        isPublished: false,
      });

      expect(published.status).toBe(201);
      expect(published.body.data.syntaxRules.required).toContain('IfStatement');
      expect(published.body.data.parameterNames).toEqual(['age']);
      expect(draft.status).toBe(201);
      studyCaseId = published.body.data.id;
      draftStudyCaseId = draft.body.data.id;
    });

    it('enforces study case authorization and validation', async () => {
      const guest = await api.post('/api/study-cases').send({});
      const student = await api.post('/api/study-cases').set(authHeader(studentToken)).send({});
      const missingMaterial = await api.post('/api/study-cases').set(authHeader(adminToken)).send({
        materialId: 99999999,
        slug: `${prefix}-missing-material-study-case`,
        title: 'Missing Material',
        description: 'Missing material study case',
        order: 3,
        starterCode: 'return true;',
        syntaxRules: { required: [], forbidden: [] },
      });
      const duplicateSlug = await api.post('/api/study-cases').set(authHeader(adminToken)).send({
        materialId,
        slug: `${prefix}-study-case`,
        title: 'Duplicate Slug',
        description: 'Duplicate slug study case',
        order: 3,
        starterCode: 'return true;',
        syntaxRules: { required: [], forbidden: [] },
      });
      const duplicateOrder = await api.post('/api/study-cases').set(authHeader(adminToken)).send({
        materialId,
        slug: `${prefix}-study-case-duplicate-order`,
        title: 'Duplicate Order',
        description: 'Duplicate order study case',
        order: 1,
        starterCode: 'return true;',
        syntaxRules: { required: [], forbidden: [] },
      });

      expect(guest.status).toBe(401);
      expect(student.status).toBe(403);
      expect(missingMaterial.status).toBe(404);
      expect(duplicateSlug.status).toBe(400);
      expect(duplicateOrder.status).toBe(400);
    });

    it('lists, sorts, filters, and protects unpublished study cases', async () => {
      const sortWithoutMaterial = await api.get('/api/study-cases?sortBy=order');
      const sortWithMaterial = await api.get(`/api/study-cases?materialId=${materialId}&sortBy=order&orderBy=asc`);
      const guestList = await api.get(`/api/study-cases?search=${prefix}`);
      const adminDrafts = await api.get(`/api/study-cases?isPublished=false&search=${prefix}`).set(authHeader(adminToken));
      const guestPublished = await api.get(`/api/study-cases/${prefix}-study-case`);
      const guestDraft = await api.get(`/api/study-cases/${prefix}-study-case-draft`);
      const adminDraft = await api.get(`/api/study-cases/${prefix}-study-case-draft`).set(authHeader(adminToken));

      expect(sortWithoutMaterial.status).toBe(400);
      expect(sortWithMaterial.status).toBe(200);
      expect(guestList.body.data.every((studyCase: any) => studyCase.isPublished)).toBe(true);
      expect(adminDrafts.body.data.some((studyCase: any) => studyCase.id === draftStudyCaseId)).toBe(true);
      expect(guestPublished.status).toBe(200);
      expect(guestDraft.status).toBe(404);
      expect(adminDraft.status).toBe(200);
    });

    it('updates and deletes study cases as admin', async () => {
      const update = await api.patch(`/api/study-cases/${studyCaseId}`).set(authHeader(adminToken)).send({
        title: `${prefix} Updated Study Case`,
        hint: 'Updated hint',
        syntaxRules: { required: ['IfStatement'], forbidden: ['ForStatement'] },
      });
      const duplicateOrder = await api.patch(`/api/study-cases/${studyCaseId}`).set(authHeader(adminToken)).send({ order: 2 });
      const forbidden = await api.patch(`/api/study-cases/${studyCaseId}`).set(authHeader(studentToken)).send({ title: 'Forbidden' });
      const missing = await api.patch('/api/study-cases/99999999').set(authHeader(adminToken)).send({ title: 'Missing' });
      const deleteDraft = await api.delete(`/api/study-cases/${draftStudyCaseId}`).set(authHeader(adminToken));

      expect(update.status).toBe(200);
      expect(update.body.data.syntaxRules.forbidden).toContain('ForStatement');
      expect(duplicateOrder.status).toBe(400);
      expect(forbidden.status).toBe(403);
      expect(missing.status).toBe(404);
      expect(deleteDraft.status).toBe(200);
    });

    it('creates test cases with input and expected JSON', async () => {
      const published = await api.post('/api/test-cases').set(authHeader(adminToken)).send({
        studyCaseId,
        description: 'should return true for age 18',
        input: { age: 18 },
        expected: { result: true },
        order: 1,
        isPublished: true,
      });
      const draft = await api.post('/api/test-cases').set(authHeader(adminToken)).send({
        studyCaseId,
        description: 'should return false for age 17',
        input: { age: 17 },
        expected: { result: false },
        order: 2,
        isPublished: false,
      });

      expect(published.status).toBe(201);
      expect(published.body.data.input).toEqual({ age: 18 });
      expect(published.body.data.expected).toEqual({ result: true });
      expect(draft.status).toBe(201);
      testCaseId = published.body.data.id;
      draftTestCaseId = draft.body.data.id;
    });

    it('enforces test case authorization and validation', async () => {
      const guest = await api.post('/api/test-cases').send({});
      const student = await api.post('/api/test-cases').set(authHeader(studentToken)).send({});
      const missingStudyCase = await api.post('/api/test-cases').set(authHeader(adminToken)).send({
        studyCaseId: 99999999,
        description: 'missing study case',
        input: { age: 18 },
        expected: { result: true },
        order: 3,
      });
      const duplicateOrder = await api.post('/api/test-cases').set(authHeader(adminToken)).send({
        studyCaseId,
        description: 'duplicate order',
        input: { age: 20 },
        expected: { result: true },
        order: 1,
      });
      const invalidJsonShape = await api.post('/api/test-cases').set(authHeader(adminToken)).send({
        studyCaseId,
        description: 'invalid input shape',
        input: 'age=18',
        expected: { result: true },
        order: 3,
      });

      expect(guest.status).toBe(401);
      expect(student.status).toBe(403);
      expect(missingStudyCase.status).toBe(404);
      expect(duplicateOrder.status).toBe(400);
      expect(invalidJsonShape.status).toBe(400);
    });

    it('lists, sorts, filters, and protects unpublished test cases', async () => {
      const sortWithoutStudyCase = await api.get('/api/test-cases?sortBy=order');
      const sortWithStudyCase = await api.get(`/api/test-cases?studyCaseId=${studyCaseId}&sortBy=order&orderBy=asc`);
      const guestList = await api.get(`/api/test-cases?studyCaseId=${studyCaseId}`);
      const adminDrafts = await api.get(`/api/test-cases?studyCaseId=${studyCaseId}&isPublished=false`).set(authHeader(adminToken));
      const guestPublished = await api.get(`/api/test-cases/${testCaseId}`);
      const guestDraft = await api.get(`/api/test-cases/${draftTestCaseId}`);
      const adminDraft = await api.get(`/api/test-cases/${draftTestCaseId}`).set(authHeader(adminToken));

      expect(sortWithoutStudyCase.status).toBe(400);
      expect(sortWithStudyCase.status).toBe(200);
      expect(guestList.body.data.every((testCase: any) => testCase.isPublished)).toBe(true);
      expect(adminDrafts.body.data.some((testCase: any) => testCase.id === draftTestCaseId)).toBe(true);
      expect(guestPublished.status).toBe(200);
      expect(guestDraft.status).toBe(404);
      expect(adminDraft.status).toBe(200);
    });

    it('updates and deletes test cases as admin', async () => {
      const update = await api.patch(`/api/test-cases/${testCaseId}`).set(authHeader(adminToken)).send({
        description: 'should still return true for age 18',
        input: { age: 19 },
        expected: { result: true },
      });
      const duplicateOrder = await api.patch(`/api/test-cases/${testCaseId}`).set(authHeader(adminToken)).send({ order: 2 });
      const forbidden = await api.patch(`/api/test-cases/${testCaseId}`).set(authHeader(studentToken)).send({ description: 'Forbidden' });
      const missing = await api.patch('/api/test-cases/99999999').set(authHeader(adminToken)).send({ description: 'Missing' });
      const deleteDraft = await api.delete(`/api/test-cases/${draftTestCaseId}`).set(authHeader(adminToken));

      expect(update.status).toBe(200);
      expect(update.body.data.input).toEqual({ age: 19 });
      expect(duplicateOrder.status).toBe(400);
      expect(forbidden.status).toBe(403);
      expect(missing.status).toBe(404);
      expect(deleteDraft.status).toBe(200);
    });
  });
});
