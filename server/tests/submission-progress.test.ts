jest.mock('../src/queues/submission.queue', () => ({
  SUBMISSION_QUEUE_NAME: 'submission',
  submissionQueue: {
    add: jest.fn().mockResolvedValue({ id: 'job-1' }),
  },
  submissionWorker: {
    on: jest.fn(),
  },
}));

import supertest from 'supertest';

import { Role, SubmissionStatus, TestResultStatus } from '../generated/prisma/enums';

import { server } from '../src/applications/server';
import { prisma } from '../src/applications/database';
import { submissionQueue } from '../src/queues/submission.queue';
import { ProgressService } from '../src/services/progress.service';

import {
  authHeader,
  cleanupTestData,
  createModuleFixture,
  createLearningPathFixture,
  createMaterialFixture,
  createExerciseFixture,
  createSubmissionFixture,
  createTestCaseFixture,
  createTestPrefix,
  createTestResultFixture,
  createUserFixture,
  nextOrder,
} from './helpers/test-data.helper';

const api = supertest(server);

const prefix = createTestPrefix('assessment');

describe('submission, AGS API, and progress endpoints', () => {
  let adminToken: string;
  let studentToken: string;
  let otherStudentToken: string;
  let studentId: number;
  let otherStudentId: number;
  let exerciseId: number;
  let unpublishedExerciseId: number;
  let testCaseId: number;
  let otherStudentSubmissionId: number;

  beforeAll(async () => {
    await cleanupTestData(prefix);
    const admin = await createUserFixture({ prefix, label: 'admin', role: Role.ADMIN });
    const student = await createUserFixture({ prefix, label: 'student', role: Role.STUDENT });
    const otherStudent = await createUserFixture({ prefix, label: 'other-student', role: Role.STUDENT });
    const learningPath = await createLearningPathFixture(prefix);

    const draftExercise = await createExerciseFixture({
      prefix,
      materialId: learningPath.material.id,
      label: 'draft-exercise',
      order: 2,
      isPublished: false,
    });

    adminToken = admin.token;
    studentToken = student.token;
    otherStudentToken = otherStudent.token;
    studentId = student.user.id;
    otherStudentId = otherStudent.user.id;
    exerciseId = learningPath.exercise.id;
    unpublishedExerciseId = draftExercise.id;
    testCaseId = learningPath.testCases[0].id;

    const otherSubmission = await createSubmissionFixture({
      userId: otherStudentId,
      exerciseId,
      status: SubmissionStatus.PASSED,
    });
    await createTestResultFixture({
      submissionId: otherSubmission.id,
      testCaseId,
    });
    otherStudentSubmissionId = otherSubmission.id;
  });

  afterAll(async () => {
    await cleanupTestData(prefix);
  });

  describe('POST /api/submissions/run', () => {
    it('requires authentication and validates payload', async () => {
      const unauthorized = await api.post('/api/submissions/run').send({
        exerciseId,
        code: 'return age >= 18;',
      });
      const invalidPayload = await api
        .post('/api/submissions/run')
        .set(authHeader(studentToken))
        .send({ exerciseId });
      const missingExercise = await api
        .post('/api/submissions/run')
        .set(authHeader(studentToken))
        .send({ exerciseId: 99999999, code: 'return true;' });

      expect(unauthorized.status).toBe(401);
      expect(invalidPayload.status).toBe(400);
      expect(missingExercise.status).toBe(404);
    });

    it('returns PASSED with expected and received output for correct code', async () => {
      const res = await api
        .post('/api/submissions/run')
        .set(authHeader(studentToken))
        .send({
          exerciseId,
          code: 'if (age >= 18) { return true; } return false;',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('PASSED');
      expect(res.body.data.testResults).toHaveLength(2);
      expect(res.body.data.testResults.every((result: any) => result.status === 'PASSED')).toBe(true);
      expect(res.body.data.testResults[0]).toMatchObject({
        expected: 'true',
        received: 'true',
      });
    });

    it('returns FAILED with expected and received output for wrong logic', async () => {
      const res = await api
        .post('/api/submissions/run')
        .set(authHeader(studentToken))
        .send({
          exerciseId,
          code: 'if (age > 18) { return true; } return false;',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('FAILED');
      expect(res.body.data.testResults.some((result: any) => result.status === 'FAILED')).toBe(true);
      expect(res.body.data.testResults[0]).toMatchObject({
        expected: 'true',
        received: 'false',
      });
      expect(res.body.data.testResults[0].failureMessage).not.toContain('node_modules');
    });

    it('returns ERROR for syntax error or syntax rule violation', async () => {
      const syntaxError = await api
        .post('/api/submissions/run')
        .set(authHeader(studentToken))
        .send({
          exerciseId,
          code: 'if (age >= 18) { return true; ',
        });

      const ruleViolationModule = await createModuleFixture({ prefix, label: 'rule-parent', order: nextOrder() });
      const ruleViolationMaterial = await createMaterialFixture({ prefix, moduleId: ruleViolationModule.id, label: 'rule-material' });
      const ruleViolationExercise = await createExerciseFixture({
        prefix,
        materialId: ruleViolationMaterial.id,
        label: 'rule-exercise',
        order: 1,
        syntaxRules: { required: ['IfStatement'], forbidden: [] },
      });
      await createTestCaseFixture({ exerciseId: ruleViolationExercise.id });

      const ruleViolation = await api
        .post('/api/submissions/run')
        .set(authHeader(studentToken))
        .send({
          exerciseId: ruleViolationExercise.id,
          code: 'return age >= 18;',
        });

      expect(syntaxError.status).toBe(200);
      expect(syntaxError.body.data.status).toBe('ERROR');
      expect(ruleViolation.status).toBe(200);
      expect(ruleViolation.body.data.status).toBe('ERROR');
      expect(ruleViolation.body.data.testResults[0].failureMessage).toContain('You must use');
    });

    it('does not allow students to run unpublished exercises', async () => {
      const studentRun = await api
        .post('/api/submissions/run')
        .set(authHeader(studentToken))
        .send({ exerciseId: unpublishedExerciseId, code: 'return true;' });
      const adminRun = await api
        .post('/api/submissions/run')
        .set(authHeader(adminToken))
        .send({ exerciseId: unpublishedExerciseId, code: 'return age >= 18;' });

      expect(studentRun.status).toBe(404);
      expect(adminRun.status).toBe(200);
    });
  });

  describe('POST /api/submissions', () => {
    it('creates a queued submission for students only', async () => {
      const res = await api
        .post('/api/submissions')
        .set(authHeader(studentToken))
        .send({ exerciseId, code: 'if (age >= 18) { return true; } return false;' });
      const admin = await api
        .post('/api/submissions')
        .set(authHeader(adminToken))
        .send({ exerciseId, code: 'return true;' });
      const guest = await api.post('/api/submissions').send({ exerciseId, code: 'return true;' });
      const invalid = await api
        .post('/api/submissions')
        .set(authHeader(studentToken))
        .send({ exerciseId });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('PENDING');
      expect(submissionQueue.add).toHaveBeenCalledWith('execute', { submissionId: res.body.data.id });
      expect(admin.status).toBe(403);
      expect(guest.status).toBe(401);
      expect(invalid.status).toBe(400);
    });

    it('does not allow students to submit unpublished exercises', async () => {
      const res = await api
        .post('/api/submissions')
        .set(authHeader(studentToken))
        .send({ exerciseId: unpublishedExerciseId, code: 'return true;' });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/submissions and /api/submissions/:id', () => {
    it('shows only student own submissions, while admin can filter by userId/status/exerciseId', async () => {
      await createSubmissionFixture({ userId: studentId, exerciseId, status: SubmissionStatus.FAILED, code: 'return false;' });

      const studentList = await api.get('/api/submissions').set(authHeader(studentToken));
      const adminFilteredByUser = await api.get(`/api/submissions?userId=${otherStudentId}`).set(authHeader(adminToken));
      const adminFilteredByStatus = await api.get('/api/submissions?status=PASSED').set(authHeader(adminToken));
      const adminFilteredByExercise = await api.get(`/api/submissions?exerciseId=${exerciseId}`).set(authHeader(adminToken));
      const invalidStatus = await api.get('/api/submissions?status=DONE').set(authHeader(adminToken));
      const unauthorized = await api.get('/api/submissions');

      expect(studentList.status).toBe(200);
      expect(studentList.body.data.every((submission: any) => submission.userId === studentId)).toBe(true);
      expect(adminFilteredByUser.status).toBe(200);
      expect(adminFilteredByUser.body.data.every((submission: any) => submission.userId === otherStudentId)).toBe(true);
      expect(adminFilteredByStatus.status).toBe(200);
      expect(adminFilteredByExercise.status).toBe(200);
      expect(invalidStatus.status).toBe(400);
      expect(unauthorized.status).toBe(401);
    });

    it('protects submission detail by owner and includes test results', async () => {
      const ownerSubmission = await createSubmissionFixture({ userId: studentId, exerciseId, status: SubmissionStatus.PASSED });
      await createTestResultFixture({ submissionId: ownerSubmission.id, testCaseId });

      const owner = await api.get(`/api/submissions/${ownerSubmission.id}`).set(authHeader(studentToken));
      const otherStudent = await api.get(`/api/submissions/${ownerSubmission.id}`).set(authHeader(otherStudentToken));
      const admin = await api.get(`/api/submissions/${ownerSubmission.id}`).set(authHeader(adminToken));
      const notFound = await api.get('/api/submissions/99999999').set(authHeader(adminToken));
      const otherStudentOwn = await api.get(`/api/submissions/${otherStudentSubmissionId}`).set(authHeader(otherStudentToken));

      expect(owner.status).toBe(200);
      expect(owner.body.data.testResults).toHaveLength(1);
      expect(otherStudent.status).toBe(403);
      expect(admin.status).toBe(200);
      expect(notFound.status).toBe(404);
      expect(otherStudentOwn.status).toBe(200);
    });
  });

  describe('progress endpoints and progression logic', () => {
    it('requires authentication for progress endpoints', async () => {
      const modules = await api.get('/api/progress/modules');
      const materials = await api.get('/api/progress/materials');
      const exercises = await api.get('/api/progress/exercises');

      expect(modules.status).toBe(401);
      expect(materials.status).toBe(401);
      expect(exercises.status).toBe(401);
    });

    it('returns existing progress records and supports material/exercise filters', async () => {
      await prisma.exerciseProgress.upsert({
        where: { userId_exerciseId: { userId: studentId, exerciseId } },
        update: { isCompleted: true, completedAt: new Date() },
        create: { userId: studentId, exerciseId, isCompleted: true, completedAt: new Date() },
      });

      const material = await prisma.material.findFirstOrThrow({ where: { exercises: { some: { id: exerciseId } } } });
      const module = await prisma.module.findFirstOrThrow({ where: { materials: { some: { id: material.id } } } });

      await prisma.materialProgress.upsert({
        where: { userId_materialId: { userId: studentId, materialId: material.id } },
        update: {},
        create: { userId: studentId, materialId: material.id },
      });
      await prisma.moduleProgress.upsert({
        where: { userId_moduleId: { userId: studentId, moduleId: module.id } },
        update: {},
        create: { userId: studentId, moduleId: module.id },
      });

      const modules = await api.get('/api/progress/modules').set(authHeader(studentToken));
      const materials = await api.get(`/api/progress/materials?moduleId=${module.id}`).set(authHeader(studentToken));
      const exercises = await api.get(`/api/progress/exercises?materialId=${material.id}`).set(authHeader(studentToken));

      expect(modules.status).toBe(200);
      expect(materials.status).toBe(200);
      expect(exercises.status).toBe(200);
      expect(exercises.body.data.some((progress: any) => progress.exerciseId === exerciseId)).toBe(true);
    });

    it('marks exercise, material, and module progress through the learning path', async () => {
      const module = await createModuleFixture({ prefix, label: 'progress-module', order: nextOrder() });
      const materialOne = await createMaterialFixture({ prefix, moduleId: module.id, label: 'progress-material-one', order: 1 });
      const materialTwo = await createMaterialFixture({ prefix, moduleId: module.id, label: 'progress-material-two', order: 2 });
      const firstExercise = await createExerciseFixture({ prefix, materialId: materialOne.id, label: 'progress-exercise-one', order: 1 });
      const secondExercise = await createExerciseFixture({ prefix, materialId: materialOne.id, label: 'progress-exercise-two', order: 2 });
      const thirdExercise = await createExerciseFixture({ prefix, materialId: materialTwo.id, label: 'progress-exercise-three', order: 1 });

      await ProgressService.updateOnSubmissionPassed(studentId, firstExercise.id);
      const firstExerciseProgress = await prisma.exerciseProgress.findUnique({
        where: { userId_exerciseId: { userId: studentId, exerciseId: firstExercise.id } },
      });
      const nextExerciseProgress = await prisma.exerciseProgress.findUnique({
        where: { userId_exerciseId: { userId: studentId, exerciseId: secondExercise.id } },
      });
      const materialAfterFirst = await prisma.materialProgress.findUnique({
        where: { userId_materialId: { userId: studentId, materialId: materialOne.id } },
      });

      await ProgressService.updateOnSubmissionPassed(studentId, secondExercise.id);
      const materialAfterSecond = await prisma.materialProgress.findUnique({
        where: { userId_materialId: { userId: studentId, materialId: materialOne.id } },
      });
      const nextMaterialProgress = await prisma.materialProgress.findUnique({
        where: { userId_materialId: { userId: studentId, materialId: materialTwo.id } },
      });
      const firstExerciseNextMaterial = await prisma.exerciseProgress.findUnique({
        where: { userId_exerciseId: { userId: studentId, exerciseId: thirdExercise.id } },
      });

      await ProgressService.updateOnSubmissionPassed(studentId, thirdExercise.id);
      const moduleProgress = await prisma.moduleProgress.findUnique({
        where: { userId_moduleId: { userId: studentId, moduleId: module.id } },
      });

      expect(firstExerciseProgress?.isCompleted).toBe(true);
      expect(nextExerciseProgress).toBeDefined();
      expect(nextExerciseProgress?.isCompleted).toBe(false);
      expect(materialAfterFirst?.isCompleted).not.toBe(true);
      expect(materialAfterSecond?.isCompleted).toBe(true);
      expect(nextMaterialProgress).toBeDefined();
      expect(firstExerciseNextMaterial).toBeDefined();
      expect(moduleProgress?.isCompleted).toBe(true);
    });
  });
});
