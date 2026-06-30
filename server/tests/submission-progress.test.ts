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
  createConceptFixture,
  createLearningPathFixture,
  createMaterialFixture,
  createStudyCaseFixture,
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
  let studyCaseId: number;
  let unpublishedStudyCaseId: number;
  let testCaseId: number;
  let otherStudentSubmissionId: number;

  beforeAll(async () => {
    await cleanupTestData(prefix);
    const admin = await createUserFixture({ prefix, label: 'admin', role: Role.ADMIN });
    const student = await createUserFixture({ prefix, label: 'student', role: Role.STUDENT });
    const otherStudent = await createUserFixture({ prefix, label: 'other-student', role: Role.STUDENT });
    const learningPath = await createLearningPathFixture(prefix);

    const draftStudyCase = await createStudyCaseFixture({
      prefix,
      materialId: learningPath.material.id,
      label: 'draft-study-case',
      order: 2,
      isPublished: false,
    });

    adminToken = admin.token;
    studentToken = student.token;
    otherStudentToken = otherStudent.token;
    studentId = student.user.id;
    otherStudentId = otherStudent.user.id;
    studyCaseId = learningPath.studyCase.id;
    unpublishedStudyCaseId = draftStudyCase.id;
    testCaseId = learningPath.testCases[0].id;

    const otherSubmission = await createSubmissionFixture({
      userId: otherStudentId,
      studyCaseId,
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
        studyCaseId,
        code: 'return age >= 18;',
      });
      const invalidPayload = await api
        .post('/api/submissions/run')
        .set(authHeader(studentToken))
        .send({ studyCaseId });
      const missingStudyCase = await api
        .post('/api/submissions/run')
        .set(authHeader(studentToken))
        .send({ studyCaseId: 99999999, code: 'return true;' });

      expect(unauthorized.status).toBe(401);
      expect(invalidPayload.status).toBe(400);
      expect(missingStudyCase.status).toBe(404);
    });

    it('returns PASSED with expected and received output for correct code', async () => {
      const res = await api
        .post('/api/submissions/run')
        .set(authHeader(studentToken))
        .send({
          studyCaseId,
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
          studyCaseId,
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
          studyCaseId,
          code: 'if (age >= 18) { return true; ',
        });

      const ruleViolationConcept = await createConceptFixture({ prefix, label: 'rule-parent', order: nextOrder() });
      const ruleViolationMaterial = await createMaterialFixture({ prefix, conceptId: ruleViolationConcept.id, label: 'rule-material' });
      const ruleViolationStudyCase = await createStudyCaseFixture({
        prefix,
        materialId: ruleViolationMaterial.id,
        label: 'rule-study-case',
        order: 1,
        syntaxRules: { required: ['IfStatement'], forbidden: [] },
      });
      await createTestCaseFixture({ studyCaseId: ruleViolationStudyCase.id });

      const ruleViolation = await api
        .post('/api/submissions/run')
        .set(authHeader(studentToken))
        .send({
          studyCaseId: ruleViolationStudyCase.id,
          code: 'return age >= 18;',
        });

      expect(syntaxError.status).toBe(200);
      expect(syntaxError.body.data.status).toBe('ERROR');
      expect(ruleViolation.status).toBe(200);
      expect(ruleViolation.body.data.status).toBe('ERROR');
      expect(ruleViolation.body.data.testResults[0].failureMessage).toContain('You must use');
    });

    it('does not allow students to run unpublished study cases', async () => {
      const studentRun = await api
        .post('/api/submissions/run')
        .set(authHeader(studentToken))
        .send({ studyCaseId: unpublishedStudyCaseId, code: 'return true;' });
      const adminRun = await api
        .post('/api/submissions/run')
        .set(authHeader(adminToken))
        .send({ studyCaseId: unpublishedStudyCaseId, code: 'return age >= 18;' });

      expect(studentRun.status).toBe(404);
      expect(adminRun.status).toBe(200);
    });
  });

  describe('POST /api/submissions', () => {
    it('creates a queued submission for students only', async () => {
      const res = await api
        .post('/api/submissions')
        .set(authHeader(studentToken))
        .send({ studyCaseId, code: 'if (age >= 18) { return true; } return false;' });
      const admin = await api
        .post('/api/submissions')
        .set(authHeader(adminToken))
        .send({ studyCaseId, code: 'return true;' });
      const guest = await api.post('/api/submissions').send({ studyCaseId, code: 'return true;' });
      const invalid = await api
        .post('/api/submissions')
        .set(authHeader(studentToken))
        .send({ studyCaseId });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('PENDING');
      expect(submissionQueue.add).toHaveBeenCalledWith('execute', { submissionId: res.body.data.id });
      expect(admin.status).toBe(403);
      expect(guest.status).toBe(401);
      expect(invalid.status).toBe(400);
    });

    it('does not allow students to submit unpublished study cases', async () => {
      const res = await api
        .post('/api/submissions')
        .set(authHeader(studentToken))
        .send({ studyCaseId: unpublishedStudyCaseId, code: 'return true;' });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/submissions and /api/submissions/:id', () => {
    it('shows only student own submissions, while admin can filter by userId/status/studyCaseId', async () => {
      await createSubmissionFixture({ userId: studentId, studyCaseId, status: SubmissionStatus.FAILED, code: 'return false;' });

      const studentList = await api.get('/api/submissions').set(authHeader(studentToken));
      const adminFilteredByUser = await api.get(`/api/submissions?userId=${otherStudentId}`).set(authHeader(adminToken));
      const adminFilteredByStatus = await api.get('/api/submissions?status=PASSED').set(authHeader(adminToken));
      const adminFilteredByStudyCase = await api.get(`/api/submissions?studyCaseId=${studyCaseId}`).set(authHeader(adminToken));
      const invalidStatus = await api.get('/api/submissions?status=DONE').set(authHeader(adminToken));
      const unauthorized = await api.get('/api/submissions');

      expect(studentList.status).toBe(200);
      expect(studentList.body.data.every((submission: any) => submission.userId === studentId)).toBe(true);
      expect(adminFilteredByUser.status).toBe(200);
      expect(adminFilteredByUser.body.data.every((submission: any) => submission.userId === otherStudentId)).toBe(true);
      expect(adminFilteredByStatus.status).toBe(200);
      expect(adminFilteredByStudyCase.status).toBe(200);
      expect(invalidStatus.status).toBe(400);
      expect(unauthorized.status).toBe(401);
    });

    it('protects submission detail by owner and includes test results', async () => {
      const ownerSubmission = await createSubmissionFixture({ userId: studentId, studyCaseId, status: SubmissionStatus.PASSED });
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
      const concepts = await api.get('/api/progress/concepts');
      const materials = await api.get('/api/progress/materials');
      const studyCases = await api.get('/api/progress/study-cases');

      expect(concepts.status).toBe(401);
      expect(materials.status).toBe(401);
      expect(studyCases.status).toBe(401);
    });

    it('returns existing progress records and supports material/study case filters', async () => {
      await prisma.studyCaseProgress.upsert({
        where: { userId_studyCaseId: { userId: studentId, studyCaseId } },
        update: { isCompleted: true, completedAt: new Date() },
        create: { userId: studentId, studyCaseId, isCompleted: true, completedAt: new Date() },
      });

      const material = await prisma.material.findFirstOrThrow({ where: { studyCases: { some: { id: studyCaseId } } } });
      const concept = await prisma.concept.findFirstOrThrow({ where: { materials: { some: { id: material.id } } } });

      await prisma.materialProgress.upsert({
        where: { userId_materialId: { userId: studentId, materialId: material.id } },
        update: {},
        create: { userId: studentId, materialId: material.id },
      });
      await prisma.conceptProgress.upsert({
        where: { userId_conceptId: { userId: studentId, conceptId: concept.id } },
        update: {},
        create: { userId: studentId, conceptId: concept.id },
      });

      const concepts = await api.get('/api/progress/concepts').set(authHeader(studentToken));
      const materials = await api.get(`/api/progress/materials?conceptId=${concept.id}`).set(authHeader(studentToken));
      const studyCases = await api.get(`/api/progress/study-cases?materialId=${material.id}`).set(authHeader(studentToken));

      expect(concepts.status).toBe(200);
      expect(materials.status).toBe(200);
      expect(studyCases.status).toBe(200);
      expect(studyCases.body.data.some((progress: any) => progress.studyCaseId === studyCaseId)).toBe(true);
    });

    it('marks study case, material, and concept progress through the learning path', async () => {
      const concept = await createConceptFixture({ prefix, label: 'progress-concept', order: nextOrder() });
      const materialOne = await createMaterialFixture({ prefix, conceptId: concept.id, label: 'progress-material-one', order: 1 });
      const materialTwo = await createMaterialFixture({ prefix, conceptId: concept.id, label: 'progress-material-two', order: 2 });
      const firstStudyCase = await createStudyCaseFixture({ prefix, materialId: materialOne.id, label: 'progress-study-one', order: 1 });
      const secondStudyCase = await createStudyCaseFixture({ prefix, materialId: materialOne.id, label: 'progress-study-two', order: 2 });
      const thirdStudyCase = await createStudyCaseFixture({ prefix, materialId: materialTwo.id, label: 'progress-study-three', order: 1 });

      await ProgressService.updateOnSubmissionPassed(studentId, firstStudyCase.id);
      const firstStudyProgress = await prisma.studyCaseProgress.findUnique({
        where: { userId_studyCaseId: { userId: studentId, studyCaseId: firstStudyCase.id } },
      });
      const nextStudyProgress = await prisma.studyCaseProgress.findUnique({
        where: { userId_studyCaseId: { userId: studentId, studyCaseId: secondStudyCase.id } },
      });
      const materialAfterFirst = await prisma.materialProgress.findUnique({
        where: { userId_materialId: { userId: studentId, materialId: materialOne.id } },
      });

      await ProgressService.updateOnSubmissionPassed(studentId, secondStudyCase.id);
      const materialAfterSecond = await prisma.materialProgress.findUnique({
        where: { userId_materialId: { userId: studentId, materialId: materialOne.id } },
      });
      const nextMaterialProgress = await prisma.materialProgress.findUnique({
        where: { userId_materialId: { userId: studentId, materialId: materialTwo.id } },
      });
      const firstStudyCaseNextMaterial = await prisma.studyCaseProgress.findUnique({
        where: { userId_studyCaseId: { userId: studentId, studyCaseId: thirdStudyCase.id } },
      });

      await ProgressService.updateOnSubmissionPassed(studentId, thirdStudyCase.id);
      const conceptProgress = await prisma.conceptProgress.findUnique({
        where: { userId_conceptId: { userId: studentId, conceptId: concept.id } },
      });

      expect(firstStudyProgress?.isCompleted).toBe(true);
      expect(nextStudyProgress).toBeDefined();
      expect(nextStudyProgress?.isCompleted).toBe(false);
      expect(materialAfterFirst?.isCompleted).not.toBe(true);
      expect(materialAfterSecond?.isCompleted).toBe(true);
      expect(nextMaterialProgress).toBeDefined();
      expect(firstStudyCaseNextMaterial).toBeDefined();
      expect(conceptProgress?.isCompleted).toBe(true);
    });
  });
});
