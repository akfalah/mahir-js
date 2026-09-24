import supertest from 'supertest';

import { Role } from '../generated/prisma/enums';

import { server } from '../src/applications/server';

import {
  authHeader,
  cleanupTestData,
  createModuleFixture,
  createMaterialFixture,
  createExerciseFixture,
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

  describe('modules', () => {
    let moduleId: number;
    let unpublishedModuleId: number;
    const moduleOrder = nextOrder();
    const unpublishedModuleOrder = nextOrder();

    it('creates published and unpublished modules as admin', async () => {
      const published = await api
        .post('/api/modules')
        .set(authHeader(adminToken))
        .send({
          slug: `${prefix}-module`,
          title: `${prefix} Module`,
          description: 'Module description',
          order: moduleOrder,
          isPublished: true,
        });

      const unpublished = await api
        .post('/api/modules')
        .set(authHeader(adminToken))
        .send({
          slug: `${prefix}-module-draft`,
          title: `${prefix} Draft Module`,
          description: 'Draft module description',
          order: unpublishedModuleOrder,
          isPublished: false,
        });

      expect(published.status).toBe(201);
      expect(unpublished.status).toBe(201);
      moduleId = published.body.data.id;
      unpublishedModuleId = unpublished.body.data.id;
    });

    it('enforces module authorization and validation', async () => {
      const guest = await api.post('/api/modules').send({});
      const student = await api
        .post('/api/modules')
        .set(authHeader(studentToken))
        .send({ slug: `${prefix}-forbidden`, title: 'Forbidden', description: 'Forbidden', order: nextOrder() });
      const duplicateSlug = await api
        .post('/api/modules')
        .set(authHeader(adminToken))
        .send({ slug: `${prefix}-module`, title: 'Duplicate', description: 'Duplicate', order: nextOrder() });
      const duplicateOrder = await api
        .post('/api/modules')
        .set(authHeader(adminToken))
        .send({ slug: `${prefix}-duplicate-order`, title: 'Duplicate', description: 'Duplicate', order: moduleOrder });
      const invalid = await api
        .post('/api/modules')
        .set(authHeader(adminToken))
        .send({ slug: 'ab', title: 'ab', description: 'ab', order: 0 });

      expect(guest.status).toBe(401);
      expect(student.status).toBe(403);
      expect(duplicateSlug.status).toBe(400);
      expect(duplicateOrder.status).toBe(400);
      expect(invalid.status).toBe(400);
    });

    it('lists, searches, filters, and protects unpublished modules', async () => {
      const guestList = await api.get(`/api/modules?search=${prefix}`);
      const studentList = await api
        .get(`/api/modules?search=${prefix}`)
        .set(authHeader(studentToken));
      const adminDrafts = await api
        .get(`/api/modules?search=${prefix}&isPublished=false`)
        .set(authHeader(adminToken));
      const sorted = await api.get('/api/modules?sortBy=order&orderBy=asc');
      const invalidPage = await api.get('/api/modules?page=abc');
      const invalidLimit = await api.get('/api/modules?limit=200');

      expect(guestList.status).toBe(200);
      expect(studentList.status).toBe(200);
      expect(guestList.body.data.every((modules: any) => modules.isPublished)).toBe(true);
      expect(studentList.body.data.every((modules: any) => modules.isPublished)).toBe(true);
      expect(adminDrafts.status).toBe(200);
      expect(adminDrafts.body.data.some((modules: any) => modules.id === unpublishedModuleId)).toBe(true);
      expect(sorted.status).toBe(200);
      expect(invalidPage.status).toBe(400);
      expect(invalidLimit.status).toBe(400);
    });

    it('shows published modules to everyone and unpublished modules only to admin', async () => {
      const guestPublished = await api.get(`/api/modules/${prefix}-module`);
      const studentPublished = await api
        .get(`/api/modules/${prefix}-module`)
        .set(authHeader(studentToken));
      const guestDraft = await api.get(`/api/modules/${prefix}-module-draft`);
      const studentDraft = await api
        .get(`/api/modules/${prefix}-module-draft`)
        .set(authHeader(studentToken));
      const adminDraft = await api
        .get(`/api/modules/${prefix}-module-draft`)
        .set(authHeader(adminToken));

      expect(guestPublished.status).toBe(200);
      expect(studentPublished.status).toBe(200);
      expect(guestDraft.status).toBe(404);
      expect(studentDraft.status).toBe(404);
      expect(adminDraft.status).toBe(200);
    });

    it('updates, publishes, unpublishes, and deletes modules as admin', async () => {
      const update = await api
        .patch(`/api/modules/${moduleId}`)
        .set(authHeader(adminToken))
        .send({ title: `${prefix} Updated module` });
      const forbidden = await api
        .patch(`/api/modules/${moduleId}`)
        .set(authHeader(studentToken))
        .send({ title: 'Forbidden' });
      const unpublish = await api
        .patch(`/api/modules/${moduleId}`)
        .set(authHeader(adminToken))
        .send({ isPublished: false });
      const publish = await api
        .patch(`/api/modules/${moduleId}`)
        .set(authHeader(adminToken))
        .send({ isPublished: true });
      const missing = await api
        .patch('/api/modules/99999999')
        .set(authHeader(adminToken))
        .send({ title: 'Missing' });
      const deleteDraft = await api
        .delete(`/api/modules/${unpublishedModuleId}`)
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
    let moduleId: number;
    let materialId: number;
    let draftMaterialId: number;

    beforeAll(async () => {
      const module = await createModuleFixture({ prefix, label: 'material-parent', order: nextOrder() });
      moduleId = module.id;
    });

    it('creates materials and sanitizes rich text content', async () => {
      const published = await api
        .post('/api/materials')
        .set(authHeader(adminToken))
        .send({
          moduleId,
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
          moduleId,
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
      const missingModule = await api.post('/api/materials').set(authHeader(adminToken)).send({
        moduleId: 99999999,
        slug: `${prefix}-missing-concept-material`,
        title: 'Missing Concept',
        description: 'Missing concept material',
        content: '<p>Content</p>',
        order: 3,
      });
      const duplicateSlug = await api.post('/api/materials').set(authHeader(adminToken)).send({
        moduleId,
        slug: `${prefix}-material`,
        title: 'Duplicate Slug',
        description: 'Duplicate slug material',
        content: '<p>Content</p>',
        order: 3,
      });
      const duplicateOrder = await api.post('/api/materials').set(authHeader(adminToken)).send({
        moduleId,
        slug: `${prefix}-material-duplicate-order`,
        title: 'Duplicate Order',
        description: 'Duplicate order material',
        content: '<p>Content</p>',
        order: 1,
      });
      const emptyContent = await api.post('/api/materials').set(authHeader(adminToken)).send({
        moduleId,
        slug: `${prefix}-empty-content`,
        title: 'Empty Content',
        description: 'Empty content material',
        content: '<script>alert("x")</script>',
        order: 3,
      });

      expect(guest.status).toBe(401);
      expect(student.status).toBe(403);
      expect(missingModule.status).toBe(404);
      expect(duplicateSlug.status).toBe(400);
      expect(duplicateOrder.status).toBe(400);
      expect(emptyContent.status).toBe(400);
    });

    it('lists, sorts, filters, and protects unpublished materials', async () => {
      const sortedWithoutConcept = await api.get('/api/materials?sortBy=order');
      const sortedWithConcept = await api.get(`/api/materials?moduleId=${moduleId}&sortBy=order&orderBy=asc`);
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

  describe('exercises and test cases', () => {
    let materialId: number;
    let exerciseId: number;
    let draftExerciseId: number;
    let testCaseId: number;
    let draftTestCaseId: number;

    beforeAll(async () => {
      const concept = await createModuleFixture({ prefix, label: 'assessment-parent', order: nextOrder() });
      const material = await createMaterialFixture({ prefix, moduleId: concept.id, label: 'assessment-material' });
      materialId = material.id;
    });

    it('creates exercises with syntax rules and metadata', async () => {
      const published = await api.post('/api/exercises').set(authHeader(adminToken)).send({
        materialId,
        slug: `${prefix}-exercise`,
        title: `${prefix} Exercise`,
        description: 'Exercise description',
        hint: 'Use an if statement.',
        order: 1,
        starterCode: 'if (age >= 18) { return true; } return false;',
        syntaxRules: { required: ['IfStatement'], forbidden: ['ImportDeclaration'] },
        parameterNames: ['age'],
        functionName: 'isAdult',
        isPublished: true,
      });
      const draft = await api.post('/api/exercises').set(authHeader(adminToken)).send({
        materialId,
        slug: `${prefix}-exercise-draft`,
        title: `${prefix} Draft Exercise`,
        description: 'Draft exercise description',
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
      exerciseId = published.body.data.id;
      draftExerciseId = draft.body.data.id;
    });

    it('enforces exercise authorization and validation', async () => {
      const guest = await api.post('/api/exercises').send({});
      const student = await api.post('/api/exercises').set(authHeader(studentToken)).send({});
      const missingMaterial = await api.post('/api/exercises').set(authHeader(adminToken)).send({
        materialId: 99999999,
        slug: `${prefix}-missing-material-exercise`,
        title: 'Missing Material',
        description: 'Missing material exercise',
        order: 3,
        starterCode: 'return true;',
        syntaxRules: { required: [], forbidden: [] },
      });
      const duplicateSlug = await api.post('/api/exercises').set(authHeader(adminToken)).send({
        materialId,
        slug: `${prefix}-exercise`,
        title: 'Duplicate Slug',
        description: 'Duplicate slug exercise',
        order: 3,
        starterCode: 'return true;',
        syntaxRules: { required: [], forbidden: [] },
      });
      const duplicateOrder = await api.post('/api/exercises').set(authHeader(adminToken)).send({
        materialId,
        slug: `${prefix}-exercise-duplicate-order`,
        title: 'Duplicate Order',
        description: 'Duplicate order exercise',
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

    it('lists, sorts, filters, and protects unpublished exercises', async () => {
      const sortWithoutMaterial = await api.get('/api/exercises?sortBy=order');
      const sortWithMaterial = await api.get(`/api/exercises?materialId=${materialId}&sortBy=order&orderBy=asc`);
      const guestList = await api.get(`/api/exercises?search=${prefix}`);
      const adminDrafts = await api.get(`/api/exercises?isPublished=false&search=${prefix}`).set(authHeader(adminToken));
      const guestPublished = await api.get(`/api/exercises/${prefix}-exercise`);
      const guestDraft = await api.get(`/api/exercises/${prefix}-exercise-draft`);
      const adminDraft = await api.get(`/api/exercises/${prefix}-exercise-draft`).set(authHeader(adminToken));

      expect(sortWithoutMaterial.status).toBe(400);
      expect(sortWithMaterial.status).toBe(200);
      expect(guestList.body.data.every((exercise: any) => exercise.isPublished)).toBe(true);
      expect(adminDrafts.body.data.some((exercise: any) => exercise.id === draftExerciseId)).toBe(true);
      expect(guestPublished.status).toBe(200);
      expect(guestDraft.status).toBe(404);
      expect(adminDraft.status).toBe(200);
    });

    it('updates and deletes exercises as admin', async () => {
      const update = await api.patch(`/api/exercises/${exerciseId}`).set(authHeader(adminToken)).send({
        title: `${prefix} Updated Exercise`,
        hint: 'Updated hint',
        syntaxRules: { required: ['IfStatement'], forbidden: ['ForStatement'] },
      });
      const duplicateOrder = await api.patch(`/api/exercises/${exerciseId}`).set(authHeader(adminToken)).send({ order: 2 });
      const forbidden = await api.patch(`/api/exercises/${exerciseId}`).set(authHeader(studentToken)).send({ title: 'Forbidden' });
      const missing = await api.patch('/api/exercises/99999999').set(authHeader(adminToken)).send({ title: 'Missing' });
      const deleteDraft = await api.delete(`/api/exercises/${draftExerciseId}`).set(authHeader(adminToken));

      expect(update.status).toBe(200);
      expect(update.body.data.syntaxRules.forbidden).toContain('ForStatement');
      expect(duplicateOrder.status).toBe(400);
      expect(forbidden.status).toBe(403);
      expect(missing.status).toBe(404);
      expect(deleteDraft.status).toBe(200);
    });

    it('creates test cases with input and expected JSON', async () => {
      const published = await api.post('/api/test-cases').set(authHeader(adminToken)).send({
        exerciseId,
        description: 'should return true for age 18',
        input: { age: 18 },
        expected: { result: true },
        order: 1,
        isPublished: true,
      });
      const draft = await api.post('/api/test-cases').set(authHeader(adminToken)).send({
        exerciseId,
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
      const missingExercise = await api.post('/api/test-cases').set(authHeader(adminToken)).send({
        exerciseId: 99999999,
        description: 'missing exercise',
        input: { age: 18 },
        expected: { result: true },
        order: 3,
      });
      const duplicateOrder = await api.post('/api/test-cases').set(authHeader(adminToken)).send({
        exerciseId,
        description: 'duplicate order',
        input: { age: 20 },
        expected: { result: true },
        order: 1,
      });
      const invalidJsonShape = await api.post('/api/test-cases').set(authHeader(adminToken)).send({
        exerciseId,
        description: 'invalid input shape',
        input: 'age=18',
        expected: { result: true },
        order: 3,
      });

      expect(guest.status).toBe(401);
      expect(student.status).toBe(403);
      expect(missingExercise.status).toBe(404);
      expect(duplicateOrder.status).toBe(400);
      expect(invalidJsonShape.status).toBe(400);
    });

    it('lists, sorts, filters, and protects unpublished test cases', async () => {
      const sortWithoutExercise = await api.get('/api/test-cases?sortBy=order');
      const sortWithExercise = await api.get(`/api/test-cases?exerciseId=${exerciseId}&sortBy=order&orderBy=asc`);
      const guestList = await api.get(`/api/test-cases?exerciseId=${exerciseId}`);
      const adminDrafts = await api.get(`/api/test-cases?exerciseId=${exerciseId}&isPublished=false`).set(authHeader(adminToken));
      const guestPublished = await api.get(`/api/test-cases/${testCaseId}`);
      const guestDraft = await api.get(`/api/test-cases/${draftTestCaseId}`);
      const adminDraft = await api.get(`/api/test-cases/${draftTestCaseId}`).set(authHeader(adminToken));

      expect(sortWithoutExercise.status).toBe(400);
      expect(sortWithExercise.status).toBe(200);
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
